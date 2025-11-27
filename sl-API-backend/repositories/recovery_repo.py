# repositories/recovery_repo.py
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["db"]

class RecoveryTokenRepository:
    def __init__(self):
        self.col = db["recovery_tokens"]

    async def create(self, data: dict):
        await self.col.insert_one(data)

    async def query(self, token: str):
        return await self.col.find_one({"token": token})

    async def delete(self, token: str):
        await self.col.delete_one({"token": token})
