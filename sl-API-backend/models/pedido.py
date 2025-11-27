from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any
from zoneinfo import ZoneInfo

CHILE = ZoneInfo("America/Santiago")

class Pedido(BaseModel):
    id: str | None = None
    idUsuario: str
    fecha: datetime | None = None 
    estado: str = "pendiente"
    metodo: str  
    total: float
    items: List[Dict[str, Any]] = []
