from repositories.carrito_repo import CarritoRepository
from bson import ObjectId

repo = CarritoRepository()

def limpiar_objeto_mongo(obj):
    """Convierte ObjectId a str para evitar errores de serialización."""
    if isinstance(obj, list):
        return [limpiar_objeto_mongo(o) for o in obj]
    if isinstance(obj, dict):
        nuevo = {}
        for k, v in obj.items():
            if isinstance(v, ObjectId):
                nuevo[k] = str(v)
            else:
                nuevo[k] = limpiar_objeto_mongo(v)
        return nuevo
    return obj

# Agregar o actualizar cantidad de un producto
async def agregar(idUsuario: str, idProducto: str, cantidad: int):
    await repo.agregar(idUsuario, idProducto, cantidad)
    carrito = await repo.obtener(idUsuario)
    return limpiar_objeto_mongo(carrito)

# Remover un producto
async def eliminar(idUsuario: str, idProducto: str):
    await repo.remover(idUsuario, idProducto)
    carrito = await repo.obtener(idUsuario)
    return limpiar_objeto_mongo(carrito)

# Obtener carrito actual
async def obtener(idUsuario: str):
    carrito = await repo.obtener(idUsuario)
    return limpiar_objeto_mongo(carrito)

# Vaciar carrito
async def limpiar(idUsuario: str):
    await repo.limpiar(idUsuario)
    carrito = await repo.obtener(idUsuario)
    return limpiar_objeto_mongo(carrito)

# Eliminar completamente el carrito
async def eliminar_carrito(idUsuario: str):
    return await repo.eliminar_carrito(idUsuario)