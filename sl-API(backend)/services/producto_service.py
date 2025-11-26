from models.producto import Producto
from repositories.producto_repo import ProductoRepository
from services import auditoria_service
from fastapi import UploadFile
from datetime import datetime
import os
import shutil
import uuid

repo = ProductoRepository()

MEDIA_FOLDER = "media"

# Guardar imagen físicamente en /media
async def guardar_imagen(file: UploadFile | None) -> str | None:
    if file is None:
        return None

    if not os.path.exists(MEDIA_FOLDER):
        os.makedirs(MEDIA_FOLDER)

    ext = file.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    full_path = os.path.join(MEDIA_FOLDER, filename)

    with open(full_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/media/{filename}"


# Validar ruta existente (si vino desde JSON)
def validar_imagen(ruta: str | None) -> str | None:
    if not ruta:
        return None

    # Normalizar
    if not ruta.startswith("/"):
        ruta = "/" + ruta

    if not ruta.startswith("/media/"):
        print("⚠ Ruta inválida (debe empezar con /media/). Se ignorará.")
        return None

    # Convertir /media/a.png → media/a.png
    file_path = ruta.lstrip("/")

    if not os.path.exists(file_path):
        print(f"⚠ Imagen no encontrada en disco: {file_path}")
        return None

    return ruta


# CREAR PRODUCTO
async def agregar(producto: Producto, usuario_admin: str, imagen: UploadFile | str | None):
    try:
        data = producto.dict(exclude_unset=True)

        if isinstance(imagen, UploadFile):
            # Subir archivo físico → genera UUID
            data["img"] = await guardar_imagen(imagen)
        elif isinstance(imagen, str):
            # Ya es una URL enviada desde frontend
            data["img"] = imagen
        else:
            # Si no hay imagen → placeholder
            data["img"] = "/media/plato.png"

        nuevo_id = await repo.create(data)

        await auditoria_service.registrar(
            entidad="producto",
            entidad_id=nuevo_id,
            accion="crear",
            usuario=usuario_admin,
            detalle=data
        )

        return {"status": "ok", "id": nuevo_id}

    except Exception as e:
        print("❌ Error en agregar producto:", e)
        return {"status": "error", "msg": str(e)}


# ACTUALIZAR PRODUCTO
async def actualizar(id: str, producto: Producto, usuario_admin: str, imagen: UploadFile | str | None = None):
    try:
        data = producto.dict(exclude_unset=True)

        if isinstance(imagen, UploadFile):
            # Imagen nueva → subir y reemplazar
            data["img"] = await guardar_imagen(imagen)
        elif isinstance(imagen, str):
            # Imagen enviada por JSON → validar
            ruta_valida = validar_imagen(imagen)
            if ruta_valida:
                data["img"] = ruta_valida
            # Si la ruta es inválida, no se cambia la img
        # Si no viene imagen nueva ni ruta → NO modificar img.

        await repo.update(id, data)

        await auditoria_service.registrar(
            entidad="producto",
            entidad_id=id,
            accion="actualizar",
            usuario=usuario_admin,
            detalle=data
        )

        return {"status": "ok"}

    except Exception as e:
        print("❌ Error en actualizar producto:", e)
        return {"status": "error", "msg": str(e)}


# ELIMINAR PRODUCTO
async def eliminar(id: str, usuario_admin: str):
    try:
        await repo.delete(id)

        await auditoria_service.registrar(
            entidad="producto",
            entidad_id=id,
            accion="eliminar",
            usuario=usuario_admin
        )

        return {"status": "ok"}

    except Exception as e:
        print("❌ Error al eliminar producto:", e)
        return {"status": "error", "msg": str(e)}


# LISTAR PRODUCTOS
async def listar():
    try:
        cursor = await repo.query({})
        productos = [p async for p in cursor]

        for p in productos:
            if "_id" in p:
                p["_id"] = str(p["_id"])

        return productos

    except Exception as e:
        print("❌ Error en listar productos:", e)
        return []



# OBTENER POR ID
async def obtener(id: str):
    try:
        producto = await repo.get(id)
        if not producto:
            return None

        producto["_id"] = str(producto["_id"])
        return producto

    except Exception as e:
        print("❌ Error al obtener producto:", e)
        return None


# ACTUALIZAR POR TOKEN
async def actualizar_por_token(token: str, data: dict):
    return await repo.update_by_token(token, data)