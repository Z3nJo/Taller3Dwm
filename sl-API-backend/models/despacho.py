from pydantic import BaseModel

class Despacho(BaseModel):
    idPedido: str
    direccion: str
    encargado: str      # idUsuario encargado
    estado: str = "pendiente"   # (pendiente / en reparto / entregado)
