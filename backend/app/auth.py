#유저 인증
from fastapi import HTTPException, Header, Depends
from .database import supabase

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="인증 토큰이 필요합니다.")
    try:
        # Bearer <token> 형태에서 토큰만 추출
        token = authorization.split(" ")[1]
        user_res = supabase.auth.get_user(token)
        return user_res.user
    except Exception:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")