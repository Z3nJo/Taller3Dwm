from config import db

class BoletaRepository:
    collection = db["boletas"]

    async def crear(self, boleta):
        result = await self.collection.insert_one(boleta)
        return str(result.inserted_id)
