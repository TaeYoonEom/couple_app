#카테고리 관련 API 엔드포인트
from fastapi import APIRouter, Depends
from ..database import supabase
from ..auth import get_current_user

router = APIRouter()

@router.get("")
async def get_categories(user = Depends(get_current_user)):
    res = supabase.table("categories").select("*").eq("user_id", user.id).execute()
    return res.data

@router.post("")
async def add_category(item: dict, user = Depends(get_current_user)):
    res = supabase.table("categories").insert({
        "title": item.get("title"),
        "color": item.get("color"),
        "user_id": user.id
    }).execute()
    return res.data

@router.delete("/{cat_id}")
async def delete_category(cat_id: int, user = Depends(get_current_user)):
    res = supabase.table("categories").delete().eq("id", cat_id).eq("user_id", user.id).execute()
    return {"message": "Deleted"}