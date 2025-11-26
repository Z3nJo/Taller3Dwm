from models.pedido import Pedido
from repositories.pedido_repo import PedidoRepository
from repositories.carrito_repo import CarritoRepository
from repositories.pago_repo import PagoRepository
from repositories.producto_repo import ProductoRepository
from datetime import datetime
from zoneinfo import ZoneInfo

CHILE = ZoneInfo("America/Santiago")

repo = PedidoRepository()
carrito_repo = CarritoRepository()
pago_repo = PagoRepository()
producto_repo = ProductoRepository()


# CONFIRMAR PEDIDO
async def confirmar(idUsuario: str, total: float, idPago: str = None):

    # Obtener carrito
    carrito = await carrito_repo.obtener(idUsuario)
    if not carrito or not carrito.get("items"):
        return {"error": "El carrito está vacío o no existe."}

    items_carrito = carrito["items"]
    items_completos = []
    total_backend = 0

    # Completar items con nombre, precio y subtotal
    for item in items_carrito:
        idProd = item.get("idProducto")
        cantidad = item.get("cantidad", 1)

        producto = await producto_repo.get(idProd)
        if not producto:
            return {"error": f"El producto con id {idProd} no existe."}

        nombre = producto.get("nombre")
        precio = producto.get("precio", 0)
        subtotal = precio * cantidad
        total_backend += subtotal

        items_completos.append({
            "idProducto": idProd,
            "nombre": nombre,
            "precio": precio,
            "cantidad": cantidad,
            "subtotal": subtotal
        })

    # Obtener pago correcto
    pagos = await pago_repo.obtener_por_usuario(idUsuario)

    if idPago:
        pago_completo = next((p for p in pagos if str(p["_id"]) == idPago), None)
    else:
        # fallback: último pago disponible
        pago_completo = pagos[-1] if pagos else None

    if not pago_completo:
        return {"error": "No se encontró un pago válido para confirmar el pedido."}

    # Marcar tarjeta pendiente como completado
    if pago_completo["metodo"] == "tarjeta" and pago_completo["estado"] == "pendiente":
        await pago_repo.actualizar_estado(str(pago_completo["_id"]), "completado")
        pago_completo["estado"] = "completado"

    metodo = pago_completo["metodo"]

    # Fecha y hora Chile
    fecha_actual = datetime.now(CHILE).strftime("%Y-%m-%d %H:%M:%S")

    # Construir pedido
    pedido = Pedido(
        idUsuario=idUsuario,
        total=total_backend,
        metodo=metodo,
        items=items_completos,
        fecha=fecha_actual
    ).dict()

    # Guardar pedido
    idPedido = await repo.create(pedido)

    # Vaciar carrito
    await carrito_repo.actualizar(idUsuario, {"idUsuario": idUsuario, "items": []})

    return {
        "pedido": idPedido,
        "total": total_backend,
        "items": items_completos,
        "estado": "confirmado",
        "metodo": metodo
    }


# LISTAR PEDIDOS POR USUARIO
async def listar_por_usuario(idUsuario: str):
    try:
        pedidos = await repo.query({"idUsuario": idUsuario})
        return pedidos
    except Exception as e:
        print("Error en listar_por_usuario:", e)
        return []

# OBTENER PEDIDO POR ID
async def obtener_por_id(id: str):
    try:
        pedido = await repo.get_by_id(id)

        if not pedido:
            return {"error": "Pedido no encontrado"}

        return pedido

    except Exception as e:
        print("Error en obtener_por_id:", e)
        return {"error": "No se pudo obtener el pedido"}
    
# ACTUALIZAR ESTADO DEL PEDIDO (ej: pendiente → cancelado)
async def actualizar(id: str, data: dict):
    try:
        # Solo permitimos actualizar el estado (seguridad/auditoría)
        nuevo_estado = data.get("estado")

        if not nuevo_estado:
            return {"error": "Debe enviar un campo 'estado'."}

        # Actualizar en Mongo (repo.update ya debe aplicar $set)
        actualizado = await repo.update(id, {"estado": nuevo_estado})

        if not actualizado:
            return {"error": "Pedido no encontrado."}

        return {
            "message": "Pedido actualizado correctamente.",
            "idPedido": id,
            "nuevoEstado": nuevo_estado
        }

    except Exception as e:
        print("Error en actualizar:", e)
        return {"error": "No se pudo actualizar el pedido."}
    
# LISTAR PEDIDOS POR ESTADO (ej: pendiente, confirmado, etc.)
async def listar_por_estado(estado: str):
    try:
        pedidos = await repo.query({"estado": estado})
        return pedidos
    except Exception as e:
        print("Error en listar_por_estado:", e)
        return []