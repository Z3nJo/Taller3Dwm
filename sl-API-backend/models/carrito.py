from pydantic import BaseModel

class ItemCarrito(BaseModel):
    idProducto: str
    cantidad: int

class Carrito(BaseModel):
    idUsuario: str
    items: list[ItemCarrito] = []
