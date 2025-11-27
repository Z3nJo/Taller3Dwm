from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Producto(BaseModel):
    id: str | None = None
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    stock: int
    img: str | None = None 

    creado_por: Optional[str] = None
    fecha_creacion: Optional[datetime] = None
    cambios: Optional[List[dict]] = None