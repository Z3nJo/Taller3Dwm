from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from auth.jwt_handler import verificar_token

security = HTTPBearer()

def usuario_actual(token: str = Depends(security)):
    try:
        return verificar_token(token.credentials)
    except:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

def solo_admin(usuario = Depends(usuario_actual)):
    if usuario["rol"] != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return usuario

def solo_dueno(usuario = Depends(usuario_actual)):
    if usuario["rol"] != "dueno":
        raise HTTPException(status_code=403, detail="No autorizado")
    return usuario

def solo_despacho(usuario = Depends(usuario_actual)):
    if usuario["rol"] != "despacho":
        raise HTTPException(status_code=403, detail="No autorizado")
    return usuario
