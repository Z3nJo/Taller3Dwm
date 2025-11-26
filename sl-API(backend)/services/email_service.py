# services/email_service.py
import os
import ssl
import urllib3
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")  # Tu API Key en variables de entorno
FROM_EMAIL = "david.cortez.leal@gmail.com"               # Email remitente verificado en SendGrid

# Solo para pruebas locales con certificados auto-firmados
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

async def enviar_email(correo_destino: str, token: str) -> int | None:
    """
    Envía un email de recuperación con SendGrid.
    Devuelve el status code si se envía correctamente, o None si falla.
    """
    asunto = "Recuperación de contraseña"
    contenido = f"""
Hola,

Has solicitado recuperar tu contraseña.
Tu token de recuperación es:

{token}

Este token es válido por 10 minutos.
"""

    mensaje = Mail(
        from_email=FROM_EMAIL,
        to_emails=correo_destino,
        subject=asunto,
        plain_text_content=contenido
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(mensaje)
        print(f"[INFO] Email enviado a {correo_destino}, status: {response.status_code}")
        return response.status_code
    except Exception as e:
        print(f"[ERROR] Error enviando email a {correo_destino}:", e)
        return None
