from fastapi import APIRouter
from pydantic import BaseModel
from models.usuario import Usuario

# Login y registro
from services.auth_service import registrar, login

# Recuperación de contraseña con MongoDB
from services.recovery_service import generar_token_recuperacion, verificar_token_recuperacion

router = APIRouter(prefix="/auth", tags=["Autenticación"])



# Modelos para requests
class LoginRequest(BaseModel):
    correo: str
    passw: str

class RecuperacionRequest(BaseModel):
    correo: str

class VerificarTokenRequest(BaseModel):
    token: str


# --------------------------
# 📌 Registro y Login
# --------------------------
@router.post("/register")
async def registrar_usuario(usuario: Usuario):
    return await registrar(usuario)

@router.post("/login")
async def iniciar_sesion(datos: LoginRequest):
    return await login(datos.correo, datos.passw)


# --------------------------
# 📌 Recuperación de contraseña
# --------------------------
@router.post("/enviar-token-recuperacion")
async def enviar_token(datos: RecuperacionRequest):
    """
    Genera un token temporal para recuperar contraseña
    """
    return await generar_token_recuperacion(datos.correo)

@router.post("/verificar-token")
async def verificar_token(datos: VerificarTokenRequest):
    """
    Verifica si el token de recuperación es válido
    """
    return await verificar_token_recuperacion(datos.token)

