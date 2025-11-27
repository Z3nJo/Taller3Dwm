from fastapi import APIRouter, Depends
from auth.dependencies import solo_dueno, solo_admin, usuario_actual
from services import reporte_service as service

router = APIRouter(prefix="/reporte", tags=["Reportes"])

@router.get("/ventas", dependencies=[Depends(solo_dueno)])
async def ventas():
    return await service.ventas_totales()

@router.get("/mas-vendidos", dependencies=[Depends(usuario_actual)])
async def mas_vendidos():
    return await service.productos_mas_vendidos()

@router.get("/stock-critico", dependencies=[Depends(solo_admin)])
async def stock(limite: int = 10):
    return await service.stock_critico(limite)

@router.get("/despachos", dependencies=[Depends(usuario_actual)])
async def despachos():
    return await service.estado_despachos()
