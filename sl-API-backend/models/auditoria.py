from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Auditoria(BaseModel):
    id: str | None = Field(default=None, alias="_id")
    entidad: str       
    entidad_id: str     
    accion: str         
    usuario: str       
    fecha: datetime     
    detalle: Optional[dict] = None 
