from passlib.hash import bcrypt
from repositories.usuario_repo import UsuarioRepository
from models.usuario import Usuario
from auth.jwt_handler import crear_token

repo = UsuarioRepository()

async def registrar(usuario: Usuario):
    # Verifica si ya existe el correo
    existe = await repo.query(usuario.correo)
    if existe:
        return {"status": "error", "msg": "Correo ya registrado"}

    # Hash de la contraseña
    usuario.passw = bcrypt.hash(usuario.passw[:72])
    data = usuario.dict(exclude_unset=True, exclude_none=True)

    # Guardar usuario
    uid = await repo.create(data)
    return {"status": "ok", "id": str(uid), "msg": "Usuario registrado exitosamente"}

async def login(correo: str, passw: str):
    user = await repo.query(correo)

    if not user:
        return {"status": "error", "msg": "Usuario no encontrado"}

    if not bcrypt.verify(passw, user["passw"]):
        return {"status": "error", "msg": "Contraseña incorrecta"}

    # Crear token con datos del usuario
    token = crear_token({
        "nombre": user["nombre"],
        "correo": user["correo"],
        "rol": user.get("rol", "cliente")
    })

    # Eliminar la contraseña antes de enviarlo al front
    user.pop("passw", None)

    return {
        "status": "ok",
        "token": token,
        "usuario": user  # enviamos todo el usuario, incluido ROL
    }