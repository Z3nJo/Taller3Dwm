# services/recovery_service.py
import secrets
from datetime import datetime, timedelta
from repositories.usuario_repo import UsuarioRepository
from repositories.recovery_repo import RecoveryTokenRepository  # nueva repo para tokens
from services.email_service import enviar_email 

repo_usuario = UsuarioRepository()
repo_token = RecoveryTokenRepository()

async def generar_token_recuperacion(correo: str):
    user = await repo_usuario.query(correo)
    if not user:
        return {"status": "error", "msg": "Correo no registrado"}

    # Generar token aleatorio
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Guardar token en MongoDB
    await repo_token.create({
        "correo": correo,
        "token": token,
        "expires_at": expires_at
    })

    # Enviar token por email usando SendGrid
    status = await enviar_email(correo, token)
    if not status:
        return {"status": "error", "msg": "No se pudo enviar el correo"}

    return {"status": "ok", "msg": "Se envió un correo con el token"}

async def verificar_token_recuperacion(token: str):
    record = await repo_token.query(token)
    if not record:
        return {"status": "error", "msg": "Token inválido"}

    if record["expires_at"] < datetime.utcnow():
        return {"status": "error", "msg": "Token expirado"}

    return {"status": "ok", "correo": record["correo"]}
