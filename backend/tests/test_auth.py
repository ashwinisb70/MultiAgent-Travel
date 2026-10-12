import pytest
from app.core.security import hash_password, verify_password, create_access_token, decode_token

def test_password_hashing():
    """Test password hashing and verification"""
    password = "test_password_123"
    hashed = hash_password(password)
    
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong_password", hashed)

def test_token_creation_and_decode():
    """Test JWT token creation and decoding"""
    test_data = {"sub": "1", "email": "test@example.com"}
    token = create_access_token(test_data)
    
    assert token is not None
    assert isinstance(token, str)
    
    decoded = decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "1"
    assert decoded["email"] == "test@example.com"

def test_invalid_token():
    """Test decoding invalid token"""
    decoded = decode_token("invalid_token_xyz")
    assert decoded is None
