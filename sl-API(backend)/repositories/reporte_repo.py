from config import db

class ReporteRepository:
    pedidos = db["pedidos"]
    productos = db["productos"]
    despachos = db["despachos"]

    async def ventas_totales(self):
        pipeline = [
            {"$group": {"_id": None, "totalVentas": {"$sum": "$total"}}}
        ]
        resultado = await self.pedidos.aggregate(pipeline).to_list(1)
        return resultado[0] if resultado else {"totalVentas": 0}

    async def productos_mas_vendidos(self):
        pipeline = [
            {"$unwind": "$items"},
            {"$group": {"_id": "$items.idProducto", "cantidadTotal": {"$sum": "$items.cantidad"}}},
            {"$sort": {"cantidadTotal": -1}}
        ]
        return await self.pedidos.aggregate(pipeline).to_list(None)

    async def stock_critico(self, limite: int):
        return await self.productos.find({"stock": {"$lt": limite}}).to_list(None)

    async def estado_despachos(self):
        return await self.despachos.find({}, {"_id": 0}).to_list(None)
