from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid
from datetime import datetime


def generate_uuid():
    return str(uuid.uuid4())


class Ativo(Base):
    __tablename__ = "ativos"

    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, ForeignKey("users.username"))

    nome = Column(String, nullable=False)
    categoria = Column(String, default="Outros")
    tipo_indexador = Column(String, default="MANUAL")
    valor_taxa = Column(Float, default=0.0)
    ticker = Column(String, nullable=True)
    status = Column(String, default="Ativo")

    valor_atual_bruto = Column(Float, default=0.0)
    imposto_estimado = Column(Float, default=0.0)
    valor_liquido_estimado = Column(Float, default=0.0)

    transacoes = relationship(
        "Transacao", back_populates="ativo", cascade="all, delete-orphan"
    )
    owner = relationship("app.modules.auth.models.User", back_populates="ativos")


class Transacao(Base):
    __tablename__ = "transacoes"

    id = Column(String, primary_key=True, default=generate_uuid)
    ativo_id = Column(String, ForeignKey("ativos.id"))
    timestamp = Column(DateTime, default=datetime.now)
    tipo = Column(String)
    valor = Column(Float)
    quantidade = Column(Float, default=0.0)

    rendimento_realizado = Column(Float, default=0.0)
    iof_pago = Column(Float, default=0.0)
    ir_pago = Column(Float, default=0.0)
    valor_liquido = Column(Float, default=0.0)

    ativo = relationship("Ativo", back_populates="transacoes")


class Passivo(Base):
    __tablename__ = "passivos"
    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, ForeignKey("users.username"))

    nome = Column(String, nullable=False)
    tipo = Column(String)

    valor_original = Column(Float)
    saldo_devedor = Column(Float)

    taxa_juros_anual = Column(Float, default=0.0)
    prazo_meses = Column(Integer, default=0)
    valor_parcela = Column(Float, default=0.0)

    data_inicio = Column(DateTime, default=datetime.now)
    status = Column(String, default="Ativo")
