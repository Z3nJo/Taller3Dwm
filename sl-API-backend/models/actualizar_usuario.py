from pydantic import BaseModel, EmailStr, Field

class ActualizarUsuario(BaseModel):
    correo: EmailStr
    passw_actual: str
    nuevos_datos: dict = Field(..., example={
        "nombre": "Nuevo Nombre",
        "telefono": "987654321",
        "direccion": "Calle Falsa 123",
        "nueva_passw": "NuevaContraseña123",
        "confirmar_passw": "NuevaContraseña123"
    })
