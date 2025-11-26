from models.pago import Pago
from repositories.pago_repo import PagoRepository
from repositories.usuario_repo import UsuarioRepository 
from datetime import datetime
from zoneinfo import ZoneInfo

CHILE = ZoneInfo("America/Santiago")

repo = PagoRepository()
usuario_repo = UsuarioRepository() 


# CREAR PAGO (normal y Webpay preliminar)
async def crear_pago(data: dict):
    """
    data puede venir de:
    - pago manual
    - pago preliminar Webpay (sin modelo Pago)
    """

    # Si viene correoUsuario → obtener idUsuario
    if "correoUsuario" in data and "idUsuario" not in data:
        usuario = await usuario_repo.get_by_correo(data["correoUsuario"])
        if usuario:
            data["idUsuario"] = str(usuario["_id"]) 

    # agregar fecha si no existe 
    if "fecha" not in data:
        data["fecha"] = datetime.now(CHILE).isoformat()

    id_pago = await repo.create(data)
    return {"mensaje": "Pago creado correctamente", "id": id_pago}


# LISTAR TODOS
async def listar_pagos():
    return await repo.get_all()


# LISTAR POR USUARIO
async def listar_por_usuario(idUsuario: str):
    return await repo.get_by_usuario(idUsuario)


# ACTUALIZAR PAGO POR ID NORMAL
async def actualizar_pago(id: str, data: dict):
    actualizado = await repo.update(id, data)
    if actualizado:
        return {"mensaje": "Pago actualizado correctamente"}
    return {"mensaje": "No se encontró el pago o no hubo cambios"}


# ACTUALIZAR PAGO USANDO TOKEN (Webpay)
async def actualizar_por_token(token_ws: str, data: dict):
    """
    Webpay devuelve el token_ws.
    Esto actualiza el pago preliminar guardado con ese token.
    """
    actualizado = await repo.update_by_token(token_ws, data)
    if actualizado:
        return {"mensaje": "Pago actualizado correctamente por token"}
    return {"mensaje": "No se encontró pago con ese token"}


# ELIMINAR
async def eliminar_pago(id: str):
    eliminado = await repo.delete(id)
    if eliminado:
        return {"mensaje": "Pago eliminado correctamente"}
    return {"mensaje": "No se encontró el pago"}
