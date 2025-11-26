from models.usuario import Usuario
from repositories.usuario_repo import UsuarioRepository
from passlib.hash import bcrypt

repo = UsuarioRepository()

async def obtener_usuario(correo: str):
    user = await repo.query(correo)
    return user

async def registrar(usuario: Usuario):
    # Verifica si el correo ya existe
    existe = await repo.query(usuario.correo)
    if existe:
        return {"status": "error", "msg": "Correo ya registrado"}

    # Hashea la contraseña antes de guardar
    usuario.passw = bcrypt.hash(usuario.passw[:72])

    # Inserta limpiando valores None o sin definir
    data = usuario.dict(exclude_unset=True, exclude_none=True)
    uid = await repo.create(data)
    return {"status": "ok", "id": uid}


async def login(correo: str, passw: str):
    user = await repo.query(correo)
    if user and bcrypt.verify(passw, user["passw"]):
        return {
            "status": "ok",
            "usuario": user["nombre"],
            "telefono": user.get("telefono"),
            "direccion": user.get("direccion"),
            "rol": user.get("rol", "cliente")
        }
    return {"status": "error", "msg": "Credenciales inválidas"}


async def actualizar_usuario(correo: str, passw_actual: str | None, nuevos_datos: dict, recuperar: bool = False):
    """
    Actualiza los datos de un usuario.
    Si 'recuperar' es True, no se verifica la contraseña actual.
    """
    user = await repo.query(correo)
    if not user:
        return {"status": "error", "msg": "Usuario no encontrado"}

    # Verificamos contraseña actual solo si no es recuperación
    if "passw" in nuevos_datos and not recuperar:
        if not passw_actual or not bcrypt.verify(passw_actual, user["passw"]):
            return {"status": "error", "msg": "Contraseña actual incorrecta"}
        # Hashea la nueva contraseña
        nuevos_datos["passw"] = bcrypt.hash(nuevos_datos["passw"][:72])

    # Si es recuperación, hasheamos la nueva contraseña directamente
    if "passw" in nuevos_datos and recuperar:
        nuevos_datos["passw"] = bcrypt.hash(nuevos_datos["passw"][:72])

    # Eliminamos campos que no deben guardarse en la DB
    for campo in ["nueva_passw", "confirm_passw"]:
        if campo in nuevos_datos:
            nuevos_datos.pop(campo)

    # Actualiza solo los campos que vienen en nuevos_datos
    await repo.update(user["_id"], nuevos_datos)
    return {"status": "ok", "msg": "Usuario actualizado"}
