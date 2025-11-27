from fastapi import APIRouter
from models.despacho import Despacho
from services import despacho_service as service

router = APIRouter(prefix="/despacho", tags=["Despacho"])

@router.post("/asignar")
async def asignar(despacho: Despacho):
    return await service.asignar_despacho(despacho)

@router.put("/estado/{idDespacho}")
async def actualizar(idDespacho: str, estado: str):
    return await service.actualizar_estado(idDespacho, estado)
