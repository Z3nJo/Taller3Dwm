from pydantic import BaseModel
from datetime import datetime

class Boleta(BaseModel):
    idUsuario: str
    fecha: datetime = datetime.utcnow()
    total: float
