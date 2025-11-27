from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.options import WebpayOptions
from transbank.common.integration_type import IntegrationType
import services.pago_service as service
import uuid

router = APIRouter(prefix="/pago", tags=["Pagos"])


# ------------------------------------------------
# CONFIGURACIÓN WEBPAY PLUS TEST (SDK 6.1.0)
# ------------------------------------------------
tx = Transaction(
    WebpayOptions(
        commerce_code="597055555532",
        api_key="579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
        integration_type=IntegrationType.TEST
    )
)


# CREAR TRANSACCIÓN WEBPAY

@router.post("/webpay")
async def crear_transaccion(data: dict):

    idUsuario = data.get("idUsuario")
    monto = data.get("monto")

    if not idUsuario:
        raise HTTPException(status_code=400, detail="idUsuario es requerido")

    if not monto:
        raise HTTPException(status_code=400, detail="monto es requerido")

    buy_order = str(uuid.uuid4())[:12]
    session_id = str(idUsuario)
    amount = int(monto)

    try:
        response = tx.create(
            buy_order=buy_order,
            session_id=session_id,
            amount=amount,
            return_url="https://slapi.onrender.com/pago/webpay/confirmar"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Guardar pago preliminar
    pago_preliminar = {
        "idUsuario": idUsuario,
        "monto": amount,
        "metodo": "webpay",
        "estado": "pendiente",
        "buy_order": buy_order,
        "token": response["token"]
    }

    await service.crear_pago(pago_preliminar)

    return {
        "url": response["url"],
        "token": response["token"]
    }


# 2) CONFIRMAR TRANSACCIÓN WEBPAY (GET o POST)

@router.post("/webpay/confirmar")
@router.get("/webpay/confirmar")
async def confirmar_pago(request: Request):

    params = dict(request.query_params)
    token_ws = params.get("token_ws")

    if not token_ws:
        return RedirectResponse("https://slapi.onrender.com/pagoFallido.html")

    try:
        result = tx.commit(token_ws)
    except Exception:
        return RedirectResponse("https://slapi.onrender.com/pagoFallido.html")

    update_data = {
        "estado": result["status"],
        "response_code": result["response_code"],
        "authorization_code": result["authorization_code"],
        "payment_type": result["payment_type_code"],
        "transaction_date": result["transaction_date"],
        "metodo": "tarjeta"
    }

    await service.actualizar_por_token(token_ws, update_data)

    # Pago exitoso
    if result["status"] == "AUTHORIZED" and result["response_code"] == 0:
        return RedirectResponse("https://saborlimeno.netlify.app/notificacionPago.html")

    # Pago rechazado
    return RedirectResponse("https://saborlimeno.netlify.app/notificacionFallo.html")


# CRUD NORMAL

@router.post("/")
async def crear_pago_manual(pago: dict):
    return await service.crear_pago(pago)

@router.get("/")
async def listar():
    return await service.listar_pagos()

@router.get("/{idUsuario}")
async def listar_por_usuario(idUsuario: str):
    return await service.listar_por_usuario(idUsuario)

@router.put("/{id}")
async def actualizar(id: str, data: dict):
    return await service.actualizar_pago(id, data)

@router.delete("/{id}")
async def eliminar(id: str):
    return await service.eliminar_pago(id)