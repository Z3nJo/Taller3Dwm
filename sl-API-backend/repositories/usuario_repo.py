from config import db
from repositories.icrud import ICRUD
from bson import ObjectId

def serialize_doc(doc):
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

class UsuarioRepository(ICRUD):

    def __init__(self):
        self.collection = db["usuarios"]

    async def create(self, usuario):
        result = await self.collection.insert_one(usuario)
        return str(result.inserted_id)

    async def get(self, id):
        doc = await self.collection.find_one({"_id": ObjectId(id)})
        return serialize_doc(doc)

    async def query(self, correo):
        doc = await self.collection.find_one({"correo": correo})
        return serialize_doc(doc)

    async def update(self, id, data):
        await self.collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        return True

    async def delete(self, id):
        await self.collection.delete_one({"_id": ObjectId(id)})
        return True
    
    async def obtener_todos(self):
        cursor = self.collection.find({}, {"passw": 0})  # excluye passw
        usuarios = await cursor.to_list(length=None)

        # Convertir ObjectId a str
        for u in usuarios:
            u["_id"] = str(u["_id"])

        return usuarios