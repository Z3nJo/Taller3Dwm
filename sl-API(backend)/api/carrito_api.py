from fastapi import APIRouter
from services import carrito_service as service

router = APIRouter(prefix="/carrito", tags=["Carrito"])

@router.get("/{idUsuario}")
async def get_cart(idUsuario: str):
    """Obtiene el carrito completo del usuario."""
    return await service.obtener(idUsuario)

@router.post("/{idUsuario}/add")
async def add_to_cart(idUsuario: str, idProducto: str, cantidad: int):
    """Agrega un producto al carrito (o suma cantidad si ya existe)."""
    return await service.agregar(idUsuario, idProducto, cantidad)

@router.post("/{idUsuario}/remove")
async def remove_from_cart(idUsuario: str, idProducto: str):
    """Remueve un producto del carrito."""
    return await service.eliminar(idUsuario, idProducto)

@router.post("/{idUsuario}/clear")
async def clear_cart(idUsuario: str):
    """Vacía completamente el carrito."""
    return await service.limpiar(idUsuario)

@router.delete("/{idUsuario}/delete")
async def delete_cart(idUsuario: str):
    """Elimina completamente el carrito del usuario (por ejemplo al cerrar sesión)."""
    return await service.eliminar_carrito(idUsuario)