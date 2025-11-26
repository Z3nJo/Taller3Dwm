from repositories.reporte_repo import ReporteRepository

repo = ReporteRepository()

async def ventas_totales():
    return await repo.ventas_totales()

async def productos_mas_vendidos():
    return await repo.productos_mas_vendidos()

async def stock_critico(limite: int):
    return await repo.stock_critico(limite)

async def estado_despachos():
    return await repo.estado_despachos()
