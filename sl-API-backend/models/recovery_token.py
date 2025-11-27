# models/recovery_token.py
from pydantic import BaseModel
from datetime import datetime

class RecoveryToken(BaseModel):
    correo: str
    token: str
    expires_at: datetime
