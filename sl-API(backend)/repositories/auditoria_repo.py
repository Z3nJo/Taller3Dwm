from config import db

class AuditoriaRepository:

    def __init__(self):
        self.collection = db["auditorias"]

    async def crear(self, data: dict):
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def listar(self, filtro: dict = {}):
        cursor = self.collection.find(filtro)
        docs = [d async for d in cursor]
        for d in docs:
            d["_id"] = str(d["_id"])
        return docs
