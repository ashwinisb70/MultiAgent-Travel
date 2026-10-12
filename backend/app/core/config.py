from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "TripGenie - AI Travel Planner"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = "postgresql://tripgenie:tripgenie@localhost:5432/tripgenie_db"
    SQLALCHEMY_ECHO: bool = False
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    
    # LLM Configuration
    LLM_PROVIDER: str = "anthropic"  # or "demo" or "gemini"
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    # Demo Mode
    USE_DEMO_MODE: bool = True
    DEMO_DATA_ENABLED: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
