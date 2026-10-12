import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.config import Base
from app.core.config import settings
from app.models.models import User
from app.core.security import hash_password

# Use SQLite for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user(db):
    """Create a test user"""
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=hash_password("password123"),
        full_name="Test User",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
