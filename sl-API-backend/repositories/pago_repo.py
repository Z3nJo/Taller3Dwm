from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from config import MONGO_URI

class PagoRepository:
    def __init__(self):
        client = AsyncIOMotorClient(MONGO_URI)
        self.db = client["tienda"]
        self.collection = self.db["pagos"]

    # CREAR
    async def create(self, data: dict):
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    # LISTAR TODOS
    async def get_all(self):
        pagos = await self.collection.find().to_list(None)
        for p in pagos:
            p["_id"] = str(p["_id"])
        return pagos

    # LISTAR POR USUARIO (original)
    async def get_by_usuario(self, idUsuario: str):
        pagos = await self.collection.find({"idUsuario": idUsuario}).to_list(None)
        for p in pagos:
            p["_id"] = str(p["_id"])
        return pagos

    # ALIAS → para compatibilidad con pedido_service
    async def obtener_por_usuario(self, idUsuario: str):
        return await self.get_by_usuario(idUsuario)

    # OBTENER POR ID
    async def get_by_id(self, id: str):
        try:
            oid = ObjectId(id)
        except Exception:
            return None

        pago = await self.collection.find_one({"_id": oid})
        if pago:
            pago["_id"] = str(pago["_id"])
        return pago

    # ACTUALIZAR POR ID
    async def update(self, id: str, data: dict):
        try:
            oid = ObjectId(id)
        except Exception:
            return False

        result = await self.collection.update_one(
            {"_id": oid},
            {"$set": data}
        )
        return result.modified_count > 0

    # ACTUALIZAR POR TOKEN (Webpay)
    async def update_by_token(self, token: str, data: dict):
        result = await self.collection.update_one(
            {"token": token},
            {"$set": data}
        )
        return result.modified_count > 0

    # ELIMINAR
    async def delete(self, id: str):
        try:
            oid = ObjectId(id)
        except Exception:
            return False

        result = await self.collection.delete_one({"_id": oid})
        return result.deleted_count > 0