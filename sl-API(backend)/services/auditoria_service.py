from models.auditoria import Auditoria
from repositories.auditoria_repo import AuditoriaRepository
from datetime import datetime

repo = AuditoriaRepository()

async def registrar(entidad: str, entidad_id: str, accion: str, usuario: str, detalle: dict = None):
    # Crear objeto auditoría
    auditoria = Auditoria(
        entidad=entidad,
        entidad_id=entidad_id,
        accion=accion,
        usuario=usuario,
        fecha=datetime.utcnow(),
        detalle=detalle
    )

    # Insertar en DB
    data = auditoria.dict(exclude_none=True, by_alias=True)
    inserted_id = await repo.crear(data)
    print(f"✅ Auditoría registrada: {accion} {entidad} ({entidad_id}), id auditoría: {inserted_id}")