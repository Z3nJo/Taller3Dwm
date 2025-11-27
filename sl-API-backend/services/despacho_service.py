from models.despacho import Despacho
from repositories.despacho_repo import DespachoRepository

repo = DespachoRepository()

async def asignar_despacho(despacho: Despacho):
    return await repo.crear(despacho.dict())

async def actualizar_estado(idDespacho: str, estado: str):
    return await repo.actualizar_estado(idDespacho, estado)
