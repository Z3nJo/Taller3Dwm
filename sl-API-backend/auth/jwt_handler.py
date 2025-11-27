import time
import jwt
from decouple import config

JWT_SECRET = config("JWT_SECRET", default="super_secreto_seguro")
JWT_ALGORITHM = "HS256"

def crear_token(data: dict):
    payload = {
        "user": data,
        "exp": time.time() + 60 * 60 * 24  # expira en 24 horas
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def verificar_token(token: str):
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if decoded["exp"] >= time.time():
            return decoded
    except Exception:
        return None
