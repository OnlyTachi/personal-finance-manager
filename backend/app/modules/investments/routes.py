from fastapi import APIRouter, Depends, HTTPException, Body, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.session import get_db
from app.modules.investments import schemas, models, service
from app.modules.history import service as history_service
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User

router = APIRouter()

# --- ATIVOS ---


@router.get("/assets", response_model=List[schemas.Ativo])
def list_assets(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
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
    if not asset or asset.owner_id != current_user.username:
        raise HTTPException(status_code=404, detail="Ativo não encontrado")
    return asset


@router.post("/assets", response_model=schemas.Ativo)
def create_asset(
    asset_in: schemas.AtivoCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset_data = asset_in.model_dump(exclude={"valor_inicial", "data_inicio"})
    asset_data["valor_atual_bruto"] = asset_in.valor_inicial
    asset_data["valor_liquido_estimado"] = asset_in.valor_inicial
    asset_data["owner_id"] = current_user.username
    new_asset = models.Ativo(**asset_data)
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)

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
        service.update_asset_balance(db, new_asset)

        # Atualiza histórico após criar ativo com aporte inicial
        background_tasks.add_task(
            history_service.rebuild_user_history, db, current_user.username
        )

    return new_asset


@router.delete("/assets/{asset_id}")
def delete_asset_route(
    asset_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = service.get_asset_by_id(db, asset_id)
    if not asset or asset.owner_id != current_user.username:
        raise HTTPException(status_code=403, detail="Acesso negado")
    service.delete_asset(db, asset_id)

    # Atualiza histórico após deletar
    background_tasks.add_task(
        history_service.rebuild_user_history, db, current_user.username
    )

    return {"message": "Ativo excluído"}


# --- TRANSAÇÕES ---


@router.post("/transactions", response_model=schemas.Transacao)
def create_transaction(
    transaction_in: schemas.TransacaoCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = service.get_asset_by_id(db, transaction_in.ativo_id)
    if not asset or asset.owner_id != current_user.username:
        raise HTTPException(status_code=403, detail="Acesso negado")

    tx = service.create_transaction(db, transaction_in)

    # Atualiza histórico quando cria transação
    background_tasks.add_task(
        history_service.rebuild_user_history, db, current_user.username
    )

    return tx


@router.delete("/transactions/{transaction_id}")
def delete_transaction_route(
    transaction_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = db.query(models.Transacao).filter(models.Transacao.id == transaction_id).first()
    if not t:
        raise HTTPException(status_code=404)
    asset = service.get_asset_by_id(db, t.ativo_id)
    if not asset or asset.owner_id != current_user.username:
        raise HTTPException(status_code=403)

    res = service.delete_transaction(db, transaction_id)

    # Atualiza histórico quando deleta transação
    background_tasks.add_task(
        history_service.rebuild_user_history, db, current_user.username
    )

    return res


@router.post("/transactions/simulate-withdrawal", response_model=schemas.SimulacaoSaque)
def simulate_withdrawal(
    ativo_id: str = Body(..., embed=True),
    valor: float = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = service.get_asset_by_id(db, ativo_id)
    if not asset or asset.owner_id != current_user.username:
        raise HTTPException(status_code=403)
    return service.simulate_withdrawal_fifo(db, ativo_id, valor)


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
        raise HTTPException(status_code=403)
    db.delete(p)
    db.commit()
    return {"message": "Passivo excluído"}


@router.post("/assets/refresh")
def refresh_prices(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    # Quando atualiza preços, o valor de "hoje" muda, mas o histórico passado se mantm no custo
    res = service.refresh_all_assets_prices(db)
    history_service.rebuild_user_history(db, current_user.username)
    return res
