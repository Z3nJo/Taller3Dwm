from fastapi import APIRouter, UploadFile, File, Form, Header
from models.producto import Producto
from services import producto_service as service
import shutil
import uuid
import os

router = APIRouter(prefix="/producto", tags=["Producto"])

MEDIA_PATH = "media"
if not os.path.exists(MEDIA_PATH):
    os.makedirs(MEDIA_PATH)


# ENDPOINT: SUBIR SOLO IMAGEN
@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    filename: str | None = Form(None)  # nombre opcional que manda el frontend
):
    # Obtener extensión
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "webp"]:
        return {"error": "Formato de imagen no permitido"}

    # Si el frontend manda un nombre, usarlo, si no generar UUID
    if filename:
        # asegurar que termine con la extensión correcta
        if not filename.lower().endswith(f".{ext}"):
            filename = f"{filename}.{ext}"
    else:
        filename = f"{uuid.uuid4()}.{ext}"

    filepath = os.path.join(MEDIA_PATH, filename)

    # Guardar archivo
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": filename,
        "url": f"/media/{filename}"  # esta URL se puede usar directamente en el frontend
    }


# CREAR PRODUCTO (RECIBE JSON CON 'img')
@router.post("/")
async def nuevo(producto: Producto, usuario: str = Header(...)):
    # Pasar el string de img al service
    imagen = producto.img if hasattr(producto, "img") else None
    return await service.agregar(producto, usuario, imagen)


# LISTAR
@router.get("/")
async def obtener():
    return await service.listar()


# OBTENER POR ID
@router.get("/{id}")
async def obtener_por_id(id: str):
    return await service.obtener(id)


# MODIFICAR PRODUCTO (JSON + img opcional)
@router.put("/{id}")
async def modificar(id: str, producto: Producto, usuario: str = Header(...)):
    imagen = producto.img if hasattr(producto, "img") else None
    return await service.actualizar(id, producto, usuario, imagen)


# BORRAR
@router.delete("/{id}")
async def borrar(id: str, usuario: str = Header(...)):
    return await service.eliminar(id, usuario)