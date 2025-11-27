from pydantic import BaseModel

class Pago(BaseModel):
    idUsuario: str
    monto: float
    metodo: str       
    estado: str = "pendiente"
