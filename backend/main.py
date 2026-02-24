from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

import google.generativeai as genai

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# .env에서 환경변수 불러오기
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 👇 제미나이 시동 걸기 (API 키 연결)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# --- 데이터 모델 ---
class TodoCreate(BaseModel):
    category_id: int
    content: str
    date: str

class TodoUpdate(BaseModel):
    is_done: bool

# --- API ---

@app.get("/")
def root():
    return {"message": "TodoMate 스타일 백엔드 준비 완료!"}

# 1. 카테고리 목록 가져오기 (색상 포함)
@app.get("/categories")
def get_categories():
    res = supabase.table("categories").select("*").execute()
    return res.data

# 2. 특정 날짜의 투두리스트 가져오기 (카테고리별로 묶어서 주는 건 프론트에서 처리)
@app.get("/todos")
def get_todos(date: str):
    # 해당 날짜의 할 일만 가져옴
    res = supabase.table("todos").select("*").eq("date", date).order("id").execute()
    return res.data

# 3. 할 일 추가하기
@app.post("/todos")
def add_todo(item: TodoCreate):
    res = supabase.table("todos").insert({
        "category_id": item.category_id,
        "content": item.content,
        "date": item.date,
        "is_done": False
    }).execute()
    return res.data

# 4. 할 일 완료 체크/해제 (Toggle)
@app.patch("/todos/{todo_id}")
def toggle_todo(todo_id: int, item: TodoUpdate):
    res = supabase.table("todos").update({"is_done": item.is_done}).eq("id", todo_id).execute()
    return res.data

# 5. 할 일 삭제
@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    res = supabase.table("todos").delete().eq("id", todo_id).execute()
    return {"message": "Deleted"}

# --- 카테고리 관련 API 추가 ---

# 1. 카테고리 추가
@app.post("/categories")
async def add_category(item: dict):
    res = supabase.table("categories").insert({
        "title": item.get("title"),
        "color": item.get("color") # 프론트에서 보낸 색상값을 그대로 저장
    }).execute()
    return res.data

# 2. 카테고리 삭제
@app.delete("/categories/{cat_id}")
async def delete_category(cat_id: int):
    # 카테고리를 삭제하면 해당 카테고리의 할 일들도 함께 삭제됩니다 (DB Cascade 설정 덕분)
    res = supabase.table("categories").delete().eq("id", cat_id).execute()
    return {"message": "Category deleted"}