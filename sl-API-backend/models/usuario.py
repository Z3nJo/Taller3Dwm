from pydantic import BaseModel, EmailStr, Field

class Usuario(BaseModel):
    id: str | None = Field(default=None, alias="_id")
    nombre: str
    correo: EmailStr
    passw: str
    telefono: str | None = None
    direccion: str | None = None
    rol: str
