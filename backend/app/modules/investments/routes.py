from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.session import get_db
from app.modules.investments import schemas, models, service
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User

router = APIRouter()

# --- ATIVOS ---


@router.get("/assets", response_model=List[schemas.Ativo])
def list_assets(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    try:
        service.create_daily_snapshot_if_needed(db, current_user.username)
    except Exception as e:
        print(f"Erro ao gerar snapshot: {e}")
    return (
        db.query(models.Ativo)
        .filter(models.Ativo.owner_id == current_user.username)
        .all()
    )


@router.get("/assets/{asset_id}", response_model=schemas.Ativo)
def get_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = service.get_asset_by_id(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Ativo não encontrado")
    if asset.owner_id != current_user.username:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return asset


@router.post("/assets", response_model=schemas.Ativo)
def create_asset(
    asset_in: schemas.AtivoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Cria o Ativo
    asset_data = asset_in.model_dump(exclude={"valor_inicial", "data_inicio"})
    asset_data["valor_atual_bruto"] = asset_in.valor_inicial
    asset_data["valor_liquido_estimado"] = asset_in.valor_inicial
    asset_data["owner_id"] = current_user.username
    new_asset = models.Ativo(**asset_data)
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)

    # 2. Cria a Transação Inicial
    if asset_in.valor_inicial > 0:
        data_transacao = (
            asset_in.data_inicio if asset_in.data_inicio else datetime.now()
        )
        t = models.Transacao(
            ativo_id=new_asset.id,
            tipo="Aporte",
            valor=asset_in.valor_inicial,
            valor_liquido=asset_in.valor_inicial,
            timestamp=data_transacao,
        )
        db.add(t)
        db.commit()

        # 3. MÁGICA AQUI: Força o cálculo de juros retroativo imediatamente
        service.update_asset_balance(db, new_asset)
        db.refresh(new_asset)

    return new_asset


@router.delete("/assets/{asset_id}")
def delete_asset_route(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = service.get_asset_by_id(db, asset_id)
    if not asset or asset.owner_id != current_user.username:
        raise HTTPException(status_code=403, detail="Acesso negado ou ativo não existe")
    service.delete_asset(db, asset_id)
    return {"message": "Ativo excluído"}


# --- TRANSAÇÕES ---


@router.post("/transactions", response_model=schemas.Transacao)
def create_transaction(
    transaction_in: schemas.TransacaoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = service.get_asset_by_id(db, transaction_in.ativo_id)
    if not asset or asset.owner_id != current_user.username:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return service.create_transaction(db, transaction_in)


@router.delete("/transactions/{transaction_id}")
def delete_transaction_route(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = db.query(models.Transacao).filter(models.Transacao.id == transaction_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    asset = service.get_asset_by_id(db, t.ativo_id)
    if not asset or asset.owner_id != current_user.username:
        raise HTTPException(status_code=403, detail="Acesso negado")

    return service.delete_transaction(db, transaction_id)


@router.post("/transactions/simulate-withdrawal", response_model=schemas.SimulacaoSaque)
def simulate_withdrawal(
    ativo_id: str = Body(..., embed=True),
    valor: float = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = service.get_asset_by_id(db, ativo_id)
    if not asset or asset.owner_id != current_user.username:
        raise HTTPException(status_code=403, detail="Acesso negado")
    try:
        return service.simulate_withdrawal_fifo(db, ativo_id, valor)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/passivos", response_model=List[schemas.Passivo])
def list_passivos(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return (
        db.query(models.Passivo)
        .filter(models.Passivo.owner_id == current_user.username)
        .all()
    )


@router.post("/passivos", response_model=schemas.Passivo)
def create_passivo(
    passivo_in: schemas.PassivoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_passivo = models.Passivo(**passivo_in.model_dump())
    new_passivo.owner_id = current_user.username
    db.add(new_passivo)
    db.commit()
    db.refresh(new_passivo)
    return new_passivo


@router.delete("/passivos/{passivo_id}")
def delete_passivo(
    passivo_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    p = db.query(models.Passivo).filter(models.Passivo.id == passivo_id).first()
    if not p or p.owner_id != current_user.username:
        raise HTTPException(status_code=403, detail="Acesso negado")
    db.delete(p)
    db.commit()
    return {"message": "Passivo excluído"}


@router.get("/history", response_model=List[schemas.Snapshot])
def get_history(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return service.get_portfolio_history(db, current_user.username)


@router.post("/assets/refresh")
def refresh_prices(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    try:
        return service.refresh_all_assets_prices(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
