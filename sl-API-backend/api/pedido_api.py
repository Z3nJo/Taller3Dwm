from fastapi import APIRouter
from services import pedido_service as service

router = APIRouter(prefix="/pedido", tags=["Pedido"])

# Crear (confirmar pedido)
@router.post("/confirmar/{idUsuario}")
async def confirmar(idUsuario: str, total: float):
    return await service.confirmar(idUsuario, total)

# Obtener un pedido por ID
@router.get("/detalle/{id}")
async def obtener_por_id(id: str):
    return await service.obtener_por_id(id)


# Listar pedidos de un usuario
@router.get("/{idUsuario}")
async def obtener(idUsuario: str):
    return await service.listar_por_usuario(idUsuario)


# Actualizar un pedido existente
@router.put("/{id}")
async def actualizar(id: str, data: dict):
    return await service.actualizar(id, data)


# Eliminar un pedido
@router.delete("/{id}")
async def eliminar(id: str):
    return await service.eliminar(id)

@router.get("/")
async def obtener_por_estado(estado: str):
    return await service.listar_por_estado(estado)