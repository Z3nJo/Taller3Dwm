from config import db
from bson import ObjectId

class DespachoRepository:
    collection = db["despachos"]

    async def crear(self, despacho):
        result = await self.collection.insert_one(despacho)
        return str(result.inserted_id)

    async def actualizar_estado(self, idDespacho, estado):
        await self.collection.update_one({"_id": ObjectId(idDespacho)}, {"$set": {"estado": estado}})
        return True
