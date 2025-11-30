# Importações FastAPI e Middleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base
from app.core.config import settings

# Importando Rotas
from app.modules.investments import routes as investment_routes
from app.modules.auth import routes as auth_routes
from app.modules.calculator import routes as calculator_routes
from app.modules.history import routes as history_routes

# Importando Models para o SQLAlchemy criar as tabelas
from app.modules.investments import models as inv_models
from app.modules.auth import models as auth_models
from app.modules.history import models as history_models

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

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
