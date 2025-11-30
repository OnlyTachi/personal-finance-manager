from sqlalchemy import func
from sqlalchemy.orm import Session
from app.modules.investments import models, schemas
from app.modules.investments import price_service
from datetime import date, datetime, timedelta
import math

# Taxa CDI Atual Aproximada (11.25% ao ano?)
# Em produção, isso deve vir de uma API ou tabela de indicadores
CURRENT_CDI_RATE = 11.25

# Tabela regressiva de IOF (0 a 29 dias)
TABELA_IOF = {
    0: 100,
    1: 96,
    2: 93,
    3: 90,
    4: 86,
    5: 83,
    6: 80,
    7: 76,
    8: 73,
    9: 70,
    10: 66,
    11: 63,
    12: 60,
    13: 56,
    14: 53,
    15: 50,
    16: 46,
    17: 43,
    18: 40,
    19: 36,
    20: 33,
    21: 30,
    22: 26,
    23: 23,
    24: 20,
    25: 16,
    26: 13,
    27: 10,
    28: 6,
    29: 3,
}


def get_aliquota_ir(dias: int) -> float:
    """Retorna a alíquota de IR baseada na tabela regressiva de Renda Fixa."""
    if dias <= 180:
        return 0.225
    elif dias <= 360:
        return 0.20
    elif dias <= 720:
        return 0.175
    else:
        return 0.15


def get_asset_by_id(db: Session, asset_id: str):
    return db.query(models.Ativo).filter(models.Ativo.id == asset_id).first()


def calculate_future_value(
    valor_original: float,
    data_original: datetime,
    taxa_anual_efetiva: float,
    data_referencia: datetime = None,
) -> float:
    """
    Calcula o valor corrigido de um montante em uma data específica.
    Utiliza 252 dias úteis como base para cálculo de juros compostos.
    """
    if data_referencia is None:
        data_referencia = datetime.now()

    if taxa_anual_efetiva <= 0 or valor_original <= 0:
        return valor_original

    dias_corridos = (data_referencia - data_original).days

    if dias_corridos <= 0:
        return valor_original

    # Aproximação de dias úteis (5/7 dos dias corridos)
    # Para maior precisão, utilizar biblioteca de feriados (ex: workalendar)
    dias_uteis = int(dias_corridos * (5 / 7))

    # Fórmula: Valor Futuro = Valor Presente * (1 + Taxa)^(dias_uteis / 252)
    taxa_diaria = (1 + taxa_anual_efetiva / 100) ** (1 / 252) - 1
    fator = (1 + taxa_diaria) ** dias_uteis

    return valor_original * fator


def update_asset_balance(db: Session, asset: models.Ativo):
    """
    Recalcula o saldo total, o lucro e os impostos (IOF e IR) do ativo
    baseando-se no histórico completo de transações (Reconstrução de Lotes).
    """
    # Se for Renda Variável (B3, Crypto, USA), o cálculo é feito via cotação atual, não juros
    if asset.tipo_indexador in ["B3", "CRYPTO", "USA"]:
        return

    # 1. Define Taxa Efetiva
    taxa_efetiva = asset.valor_taxa
    if asset.tipo_indexador == "CDI":
        taxa_efetiva = CURRENT_CDI_RATE * (asset.valor_taxa / 100.0)

    # 2. Busca todas as transações ordenadas cronologicamente
    transacoes = (
        db.query(models.Transacao)
        .filter(models.Transacao.ativo_id == asset.id)
        .order_by(models.Transacao.timestamp.asc())
        .all()
    )

    lotes = []
    data_hoje = datetime.now()

    # 3. Processa FIFO (Primeiro que Entra, Primeiro que Sai)
    for t in transacoes:
        if t.tipo == "Aporte":
            val_atualizado = calculate_future_value(
                t.valor, t.timestamp, taxa_efetiva, data_hoje
            )
            lotes.append(
                {
                    "data": t.timestamp,
                    "principal_restante": t.valor,  # Valor original investido que ainda está lá
                    "valor_atual": val_atualizado,  # Valor corrigido hoje
                }
            )
        elif t.tipo == "Saque":
            valor_a_deduzir = t.valor

            # Percorre os lotes antigos para descontar o saque
            for lote in lotes:
                if valor_a_deduzir <= 0.001:
                    break
                if lote["valor_atual"] <= 0.001:
                    continue  # Lote já esgotado

                if valor_a_deduzir >= lote["valor_atual"]:
                    # Saque consome todo este lote
                    valor_a_deduzir -= lote["valor_atual"]
                    lote["valor_atual"] = 0.0
                    lote["principal_restante"] = 0.0
                else:
                    # Saque parcial deste lote
                    pct_removido = valor_a_deduzir / lote["valor_atual"]
                    lote["valor_atual"] -= valor_a_deduzir
                    # Deduz proporcionalmente do principal para manter coerência no lucro futuro
                    lote["principal_restante"] -= (
                        lote["principal_restante"] * pct_removido
                    )
                    valor_a_deduzir = 0.0

    # 4. Calcula Totais e Impostos sobre o saldo restante
    saldo_bruto = 0.0
    imposto_total = 0.0

    is_isento = (
        "LCI" in str(asset.nome).upper()
        or "LCA" in str(asset.nome).upper()
        or "ISENTO" in str(asset.nome).upper()
    )

    for lote in lotes:
        if lote["valor_atual"] > 0.01:
            saldo_bruto += lote["valor_atual"]

            # Lucro = Valor Atual - Principal Investido
            lucro = lote["valor_atual"] - lote["principal_restante"]

            if lucro > 0:
                dias = (data_hoje - lote["data"]).days

                # Cálculo IOF (apenas se < 30 dias)
                aliq_iof = TABELA_IOF.get(dias, 0) / 100.0 if dias < 30 else 0.0
                val_iof = lucro * aliq_iof

                # Cálculo IR (sobre lucro descontado do IOF)
                base_ir = lucro - val_iof
                aliq_ir = 0.0 if is_isento else get_aliquota_ir(dias)
                val_ir = base_ir * aliq_ir

                imposto_total += val_iof + val_ir

    # 5. Salva no Banco
    asset.valor_atual_bruto = round(saldo_bruto, 2)
    asset.imposto_estimado = round(imposto_total, 2)
    asset.valor_liquido_estimado = round(saldo_bruto - imposto_total, 2)

    db.add(asset)
    db.commit()


def create_transaction(db: Session, transaction_in: schemas.TransacaoCreate):
    """Cria uma transação e dispara a atualização do saldo do ativo."""
    transaction = models.Transacao(**transaction_in.model_dump())
    db.add(transaction)

    asset = get_asset_by_id(db, transaction_in.ativo_id)
    if asset:
        # Lógica simples para Renda Variável (apenas soma/subtrai valor)
        if asset.tipo_indexador in ["B3", "CRYPTO", "USA"]:
            if transaction_in.tipo == "Aporte":
                asset.valor_atual_bruto += transaction_in.valor
                # Assume líquido = bruto temporariamente até atualizar cotação
                asset.valor_liquido_estimado += transaction_in.valor
            elif transaction_in.tipo == "Saque":
                asset.valor_atual_bruto -= transaction_in.valor
                val_liq = (
                    transaction_in.valor_liquido
                    if transaction_in.valor_liquido
                    else transaction_in.valor
                )
                asset.valor_liquido_estimado -= val_liq

            db.add(asset)
            db.commit()
        else:
            # Para Renda Fixa, precisamos recalcular tudo devido aos juros compostos
            db.commit()  # Salva a transação antes de recalcular
            update_asset_balance(db, asset)

    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, transaction_id: str):
    t = db.query(models.Transacao).filter(models.Transacao.id == transaction_id).first()
    if not t:
        raise Exception("Transação não encontrada")

    asset_id = t.ativo_id
    db.delete(t)
    db.commit()

    asset = get_asset_by_id(db, asset_id)
    if asset:
        update_asset_balance(db, asset)

    return {"message": "Transação excluída."}


def delete_asset(db: Session, asset_id: str):
    asset = get_asset_by_id(db, asset_id)
    if not asset:
        raise Exception("Ativo não encontrado")
    db.delete(asset)
    db.commit()
    return {"message": "Ativo excluído."}


def create_daily_snapshot_if_needed(db: Session, user_username: str):
    """Cria um registro histórico do saldo total do dia se ainda não existir."""
    today = date.today()
    existing = (
        db.query(models.Snapshot)
        .filter(models.Snapshot.owner_id == user_username)
        .filter(func.date(models.Snapshot.timestamp) == today)
        .first()
    )

    assets = db.query(models.Ativo).filter(models.Ativo.owner_id == user_username).all()
    total_bruto = sum(a.valor_atual_bruto for a in assets)

    if existing:
        existing.valor_total_bruto = total_bruto
    else:
        new_snap = models.Snapshot(
            owner_id=user_username,
            timestamp=datetime.now(),
            valor_total_bruto=total_bruto,
        )
        db.add(new_snap)
    db.commit()


def calculate_asset_quantity(db: Session, asset_id: str) -> float:
    """Calcula a quantidade total de cotas/unidades (usado para RV)."""
    transacoes = (
        db.query(models.Transacao).filter(models.Transacao.ativo_id == asset_id).all()
    )
    qtd = 0.0
    for t in transacoes:
        if t.tipo == "Aporte":
            qtd += t.quantidade or 0.0
        elif t.tipo == "Saque":
            qtd -= t.quantidade or 0.0
    return max(0.0, qtd)


def simulate_withdrawal_fifo(
    db: Session, asset_id: str, valor_saque_bruto: float
) -> schemas.SimulacaoSaque:
    """
    Simula quanto imposto seria pago se o usuário sacasse X valor hoje,
    respeitando a regra FIFO.
    """
    asset = get_asset_by_id(db, asset_id)
    if not asset:
        raise Exception("Ativo não encontrado")

    taxa_efetiva = asset.valor_taxa
    if asset.tipo_indexador == "CDI":
        taxa_efetiva = CURRENT_CDI_RATE * (asset.valor_taxa / 100.0)

    # 1. Reconstrói o estado atual (Virtualmente)
    transacoes = (
        db.query(models.Transacao)
        .filter(models.Transacao.ativo_id == asset_id)
        .order_by(models.Transacao.timestamp.asc())
        .all()
    )

    lotes = []
    data_hoje = datetime.now()

    # Processa histórico para chegar no saldo atual disponível por lote
    for t in transacoes:
        if t.tipo == "Aporte":
            val_atual = calculate_future_value(
                t.valor, t.timestamp, taxa_efetiva, data_hoje
            )
            fator_crescimento = val_atual / t.valor if t.valor > 0 else 1.0

            lotes.append(
                {
                    "id": t.id,
                    "data": t.timestamp,
                    "principal_restante": t.valor,
                    "fator_crescimento": fator_crescimento,
                }
            )

        elif t.tipo == "Saque":
            valor_a_deduzir = t.valor
            for lote in lotes:
                if valor_a_deduzir <= 0.001:
                    break

                # Calcula valor bruto atual deste lote específico
                valor_bruto_lote = (
                    lote["principal_restante"] * lote["fator_crescimento"]
                )
                if valor_bruto_lote <= 0.001:
                    continue  # Lote vazio

                if valor_a_deduzir >= valor_bruto_lote:
                    valor_a_deduzir -= valor_bruto_lote
                    lote["principal_restante"] = 0.0
                else:
                    # Descobre quanto de principal precisa reduzir para atingir o valor bruto do saque
                    principal_consumido = valor_a_deduzir / lote["fator_crescimento"]
                    lote["principal_restante"] -= principal_consumido
                    valor_a_deduzir = 0.0

    # 2. Simula o Novo Saque sobre os lotes restantes
    valor_restante_saque = valor_saque_bruto
    total_iof = 0.0
    total_ir = 0.0
    total_lucro = 0.0
    detalhes = []

    is_isento = (
        "LCI" in str(asset.nome).upper()
        or "LCA" in str(asset.nome).upper()
        or "ISENTO" in str(asset.nome).upper()
    )

    for lote in lotes:
        if valor_restante_saque <= 0.001:
            break
        if lote["principal_restante"] <= 0.001:
            continue

        valor_bruto_lote = lote["principal_restante"] * lote["fator_crescimento"]

        if valor_restante_saque >= valor_bruto_lote:
            # Consome lote inteiro
            qtd_sacada = valor_bruto_lote
            principal_sacado = lote["principal_restante"]
        else:
            # Consome parcial
            qtd_sacada = valor_restante_saque
            principal_sacado = qtd_sacada / lote["fator_crescimento"]

        lucro = qtd_sacada - principal_sacado
        if lucro < 0:
            lucro = 0

        dias = (data_hoje - lote["data"]).days

        # Impostos
        aliq_iof = TABELA_IOF.get(dias, 0) / 100.0 if dias < 30 else 0.0
        val_iof = lucro * aliq_iof

        base_ir = lucro - val_iof
        aliq_ir = 0.0 if is_isento else get_aliquota_ir(dias)
        val_ir = base_ir * aliq_ir

        total_iof += val_iof
        total_ir += val_ir
        total_lucro += lucro
        valor_restante_saque -= qtd_sacada

        detalhes.append(
            f"Lote {lote['data'].strftime('%d/%m/%Y')}: Sacado R$ {qtd_sacada:.2f} "
            f"(Lucro R$ {lucro:.2f}, IR: {aliq_ir*100:.1f}%)"
        )

    valor_liquido_final = valor_saque_bruto - total_iof - total_ir

    return schemas.SimulacaoSaque(
        valor_bruto=valor_saque_bruto,
        valor_liquido=round(valor_liquido_final, 2),
        total_imposto=round(total_iof + total_ir, 2),
        iof=round(total_iof, 2),
        ir=round(total_ir, 2),
        lucro_realizado=round(total_lucro, 2),
        detalhes=detalhes,
    )


def refresh_all_assets_prices(db: Session):
    """Atualiza preços de mercado (RV) e recalcula juros (RF)."""
    assets = db.query(models.Ativo).all()
    count = 0
    for asset in assets:
        if asset.tipo_indexador in ["B3", "CRYPTO", "USA"] and asset.ticker:
            preco = price_service.get_price(asset.ticker, asset.tipo_indexador)
            if preco > 0:
                qtd = calculate_asset_quantity(db, asset.id)
                asset.valor_atual_bruto = round(qtd * preco, 2)
                # Para RV simplificado, assumimos liquido = bruto na atualização de preço
                asset.valor_liquido_estimado = asset.valor_atual_bruto
                db.add(asset)
                count += 1
        elif asset.tipo_indexador in ["CDI", "PRE", "IPCA"]:
            update_asset_balance(db, asset)
            count += 1

    db.commit()
    return {"message": f"Atualizados: {count}"}


def get_portfolio_history(db: Session, user_username: str):
    return (
        db.query(models.Snapshot)
        .filter(models.Snapshot.owner_id == user_username)
        .order_by(models.Snapshot.timestamp.asc())
        .all()
    )
