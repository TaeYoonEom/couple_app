import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List

app = FastAPI()

# 1. CORS 설정 (프론트엔드 통신 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Supabase 연결 설정
# [주의] Supabase 설정 > API 메뉴에서 주소와 키를 복사해서 넣으세요!
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 3. 데이터 모델 정의 (일정 추가용)
class ScheduleCreate(BaseModel):
    title: str
    date: str
    content: str

@app.get("/")
def read_root():
    return {"message": "Supabase와 연결된 커플 앱 백엔드입니다!"}

# 4. 일정 저장 API (POST)
@app.post("/schedules")
async def add_schedule(item: ScheduleCreate):
    response = supabase.table("schedules").insert({
        "title": item.title,
        "date": item.date,
        "content": item.content
    }).execute()
    return {"status": "success", "data": response.data}

# 5. 모든 일정 가져오기 API (GET)
@app.get("/schedules")
async def get_schedules():
    response = supabase.table("schedules").select("*").order("date").execute()
    return response.data