import asyncio
from config import db

async def test_connection():
    try:
        # Intentar listar las colecciones de la base de datos
        collections = await db.list_collection_names()
        print("✅ Conexión exitosa a MongoDB.")
        print(f"📂 Colecciones en la base de datos: {collections}")
    except Exception as e:
        print("❌ Error al conectar con MongoDB:")
        print(e)

if __name__ == "__main__":
    asyncio.run(test_connection())
