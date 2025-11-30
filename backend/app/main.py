# Importações FastAPI e Middleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base, SessionLocal
from app.core.config import settings
from contextlib import asynccontextmanager
import logging

# Importações para o Scheduler
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

# Importando Rotas
from app.modules.investments import routes as investment_routes
from app.modules.auth import routes as auth_routes
from app.modules.calculator import routes as calculator_routes
from app.modules.history import routes as history_routes

# Importando Services para o Job
from app.modules.investments import service as inv_service
from app.modules.auth import models as auth_models
from app.modules.history import service as history_service

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Importando Models para o SQLAlchemy criar as tabelas
from app.modules.investments import models as inv_models
from app.modules.auth import models as auth_models
from app.modules.history import models as history_models

Base.metadata.create_all(bind=engine)


# --- TAREFAS AGENDADAS (JOBS) ---
def scheduled_market_update():
    """
    Roda diariamente para:
    1. Atualizar Taxa CDI (Se houver reunião do Copom)
    2. Atualizar Preços de Mercado (Ações/Cripto)
    3. Recalcular histórico dos usuários
    """
    logger.info("⏳ Iniciando atualização agendada de mercado...")

    # 1. Atualiza Variavel Global do CDI
    inv_service.update_cdi_rate_variable()

    # 2. Atualiza Preços dos Ativos no Banco
    db = SessionLocal()
    try:
        # Atualiza cotações (Yahoo/CoinGecko) e recalcula Renda Fixa com novo CDI
        inv_service.refresh_all_assets_prices(db)

        # 3. Reconstrói histórico para todos os usuários (para o gráfico não ficar defasado)
        users = db.query(auth_models.User).all()
        for user in users:
            history_service.rebuild_user_history(db, user.username)

        logger.info("✅ Atualização agendada concluída com sucesso.")
    except Exception as e:
        logger.error(f"❌ Erro na atualização agendada: {e}")
    finally:
        db.close()


# --- LIFESPAN (Inicialização) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicia o Scheduler
    scheduler = AsyncIOScheduler()

    # Configura para rodar todo dia às 09:00 e 18:00 (Horário do servidor)
    # Ou a cada 12 horas para garantir
    scheduler.add_job(scheduled_market_update, CronTrigger(hour="9,18", minute="0"))

    scheduler.start()
    logger.info("🚀 Scheduler de Investimentos iniciado.")

    yield

    # Desliga o Scheduler
    scheduler.shutdown()


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Investimento API está online! 🚀"}


app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(
    investment_routes.router, prefix="/api/v1/investments", tags=["Investments"]
)
app.include_router(
    calculator_routes.router, prefix="/api/v1/calculator", tags=["Calculadoras"]
)
app.include_router(history_routes.router, prefix="/api/v1/history", tags=["History"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
