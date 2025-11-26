from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from services.usuario_service import registrar, login, actualizar_usuario
from repositories.usuario_repo import UsuarioRepository
from services.recovery_service import generar_token_recuperacion, verificar_token_recuperacion  # <- nuevo

router = APIRouter(prefix="/usuario", tags=["Usuario"])
repo = UsuarioRepository() 

# Modelos
class UsuarioCreate(BaseModel):
    nombre: str
    correo: EmailStr
    passw: str
    telefono: str | None = None
    direccion: str | None = None
    rol: str

class UsuarioLogin(BaseModel):
    correo: EmailStr
    passw: str

class UsuarioUpdate(BaseModel):
    correo: EmailStr
    passw_actual: str
    nombre: str | None = None
    telefono: str | None = None
    direccion: str | None = None
    nueva_passw: str | None = None
    confirm_passw: str | None = None

class RecuperarRequest(BaseModel):
    token: str
    nueva_passw: str
    confirm_passw: str

# Endpoints existentes
@router.post("/registro")
async def registro(usuario: UsuarioCreate):
    return await registrar(usuario)

@router.post("/login")
async def iniciar_sesion(datos: UsuarioLogin):
    return await login(datos.correo, datos.passw)

@router.put("/actualizar")
async def put_usuario(datos: UsuarioUpdate):
    correo = datos.correo
    passw_actual = datos.passw_actual

    nuevos_datos = {k: v for k, v in datos.dict().items()
                    if k not in ["correo", "passw_actual", "confirm_passw"] and v is not None}

    if datos.nueva_passw:
        if datos.nueva_passw != datos.confirm_passw:
            return {"status": "error", "msg": "La nueva contraseña y la confirmación no coinciden"}
        nuevos_datos["passw"] = datos.nueva_passw

    return await actualizar_usuario(correo, passw_actual, nuevos_datos)

@router.get("/{correo}")
async def obtener_usuario(correo: str):
    user = await repo.query(correo)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.pop("passw", None)
    return user

@router.get("/")
async def obtener_usuarios():
    return await repo.obtener_todos()

# Endpoint de recuperación
@router.post("/recuperar")
async def recuperar_contrasena(datos: RecuperarRequest):
    """
    Cambiar la contraseña usando token de recuperación
    """
    # 1️⃣ Verificar token
    resultado = await verificar_token_recuperacion(datos.token)
    if resultado.get("status") != "ok":
        return {"status": "error", "msg": resultado.get("msg", "Token inválido")}

    correo = resultado["correo"]

    # Verificar que las nuevas contraseñas coincidan
    if datos.nueva_passw != datos.confirm_passw:
        return {"status": "error", "msg": "Las contraseñas no coinciden"}

    # Actualizar la contraseña directamente en la DB usando recuperar=True
    nuevos_datos = {"passw": datos.nueva_passw}
    return await actualizar_usuario(correo, passw_actual=None, nuevos_datos=nuevos_datos, recuperar=True)