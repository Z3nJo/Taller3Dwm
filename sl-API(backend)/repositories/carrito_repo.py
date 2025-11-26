from config import db
from bson import ObjectId

class CarritoRepository:
    collection = db["carritos"]

    # Obtener carrito (si no existe, se crea vacío)
    async def obtener(self, idUsuario):
        carrito = await self.collection.find_one({"idUsuario": idUsuario})
        if carrito:
            carrito["_id"] = str(carrito["_id"])  # evitar error de ObjectId no serializable
            return carrito
        await self.collection.insert_one({"idUsuario": idUsuario, "items": []})
        return {"idUsuario": idUsuario, "items": []}

    # Agregar producto (usa $push o actualiza cantidad si ya existe)
    async def agregar(self, idUsuario: str, idProducto: str, cantidad: int):
        carrito = await self.collection.find_one({"idUsuario": idUsuario})

        if carrito:
            # Verificar si el producto ya está en el carrito
            producto_existente = next(
                (item for item in carrito["items"] if item["idProducto"] == idProducto),
                None
            )

            if producto_existente:
                # Si ya está, actualizar la cantidad en el array con $set
                await self.collection.update_one(
                    {"idUsuario": idUsuario, "items.idProducto": idProducto},
                    {"$inc": {"items.$.cantidad": cantidad}}  # incrementa cantidad existente
                )
            else:
                # Si no existe, agregar nuevo item
                await self.collection.update_one(
                    {"idUsuario": idUsuario},
                    {"$push": {"items": {"idProducto": idProducto, "cantidad": cantidad}}}
                )
        else:
            # Crear carrito nuevo si no existe
            await self.collection.insert_one({
                "idUsuario": idUsuario,
                "items": [{"idProducto": idProducto, "cantidad": cantidad}]
            })

        return {"status": "ok"}

    # Remover un producto específico del carrito
    async def remover(self, idUsuario: str, idProducto: str):
        await self.collection.update_one(
            {"idUsuario": idUsuario},
            {"$pull": {"items": {"idProducto": idProducto}}}
        )
        return {"status": "removed"}

    # Vaciar completamente el carrito
    async def limpiar(self, idUsuario: str):
        await self.collection.update_one(
            {"idUsuario": idUsuario},
            {"$set": {"items": []}}
        )
        return {"status": "cleared"}

    # Actualizar carrito completo (si lo necesitas)
    async def actualizar(self, idUsuario, carrito):
        # asegurarse de no pasar ObjectId en el update
        carrito.pop("_id", None)
        await self.collection.update_one({"idUsuario": idUsuario}, {"$set": carrito})
        return True
    
    # Eliminar documento de carrito completamente
    async def eliminar_carrito(self, idUsuario: str):
        await self.collection.delete_one({"idUsuario": idUsuario})
        return {"status": "deleted"}
