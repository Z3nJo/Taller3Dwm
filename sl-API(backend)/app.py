from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.usuario_api import router as usuario_router
from api.producto_api import router as producto_router
from api.carrito_api import router as carrito_router
from api.pedido_api import router as pedido_router
from api.pago_api import router as pago_router
from api.despacho_api import router as despacho_router
from api.auth_api import router as auth_router
from fastapi.staticfiles import StaticFiles
import os


app = FastAPI(title="Sabor Limeño API")

MEDIA_DIR = "media"
os.makedirs(MEDIA_DIR, exist_ok=True)

app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

origins = [
    "http://127.0.0.1:5500",  
    "http://localhost",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuario_router)
app.include_router(producto_router)
app.include_router(carrito_router)
app.include_router(pedido_router)
app.include_router(pago_router)
app.include_router(despacho_router)
app.include_router(auth_router) 

@app.get("/")
def read_root():
    return {"message": "API de Sabor Limeño, acceso exitoso"}