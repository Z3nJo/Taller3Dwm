from config import db
from bson import ObjectId

class PedidoRepository:
    collection = db["pedidos"]

    async def create(self, data):
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def query(self, filtro):
        cursor = self.collection.find(filtro)
        pedidos = []
        async for p in cursor:
            p["_id"] = str(p["_id"])
            pedidos.append(p)
        return pedidos

    async def get_by_id(self, id: str):
        pedido = await self.collection.find_one({"_id": ObjectId(id)})
        if pedido:
            pedido["_id"] = str(pedido["_id"])
        return pedido

    async def update(self, id: str, data: dict):
        result = await self.collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        return result.modified_count > 0

    async def delete(self, id: str):
        result = await self.collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0