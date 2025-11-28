from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    PROJECT_NAME: str = "Investimento API"
    API_V1_STR: str = "/api/v1"

    # Segurança (Em produção, use uma chave aleatória gerada via 'openssl rand -hex 32')
    SECRET_KEY: str = "trocar_por_uma_chave_segura_em_producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 semana

    # Banco de Dados
    # BASE_DIR aponta para a raiz do backend/
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    # O arquivo será criado em backend/investimentos.db
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/investimentos.db"

    class Config:
        case_sensitive = True


settings = Settings()
