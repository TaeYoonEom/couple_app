# 할 일 관리 및 제미나이 분석 API
from fastapi import APIRouter, Depends, HTTPException
import google.generativeai as genai
from ..database import supabase
from ..auth import get_current_user
from ..models import TodoCreate, TodoAnalyzeRequest

router = APIRouter()

@router.get("/")
async def get_todos(date: str, user = Depends(get_current_user)):
    res = supabase.table("todos").select("*").eq("date", date).eq("user_id", user.id).order("id").execute()
    return res.data

@router.post("/")
async def add_todo(item: TodoCreate, user = Depends(get_current_user)):
    res = supabase.table("todos").insert({
        "category_id": item.category_id,
        "content": item.content,
        "date": item.date,
        "is_done": False,
        "user_id": user.id
    }).execute()
    return res.data

@router.patch("/{todo_id}")
async def toggle_todo(todo_id: int, item: dict, user = Depends(get_current_user)):
    res = supabase.table("todos").update({"is_done": item.get("is_done")}).eq("id", todo_id).eq("user_id", user.id).execute()
    return res.data

@router.delete("/{todo_id}")
async def delete_todo(todo_id: int, user = Depends(get_current_user)):
    res = supabase.table("todos").delete().eq("id", todo_id).eq("user_id", user.id).execute()
    return {"message": "Deleted"}

@router.post("/analyze")
async def analyze_todos(req: TodoAnalyzeRequest, user = Depends(get_current_user)):
    try:
        # 1. 데이터가 비어있는지 확인
        if not req.todos:
            return {"reply": "분석할 할 일이 없습니다. 먼저 할 일을 등록해 주세요!"}
        
        # 2. 안전하게 텍스트 추출 (내용이 있는 것만 필터링)
        todo_contents = [t.get('content') for t in req.todos if t.get('content')]
        
        if not todo_contents:
            return {"reply": "분석할 수 있는 텍스트 내용이 없습니다."}

        todo_list_str = "\n".join([f"- {content}" for content in todo_contents])
        
        prompt = f"""
        당신은 전문적인 라이프 코치입니다. 사용자의 오늘 할 일 목록을 분석해서:
        1. 가장 중요한 일 3가지를 선정하고 이유를 설명해주세요.
        2. 전반적인 일정 관리에 대한 짧은 조언을 해주세요.
        
        할 일 목록:
        {todo_list_str}
        
        응답은 친절한 말투로 한국어로 해주세요.
        """
        
        # 3. 모델 호출 (flash 모델 확인)
        model = genai.GenerativeModel('models/gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        if not response.text:
            raise ValueError("AI가 답변을 생성하지 못했습니다.")
            
        return {"reply": response.text}
    
    except Exception as e:
        # 터미널에 찍히는 로그를 통해 진짜 원인을 파악할 수 있습니다.
        print(f"🔥 AI 분석 상세 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"서버 내부 오류: {str(e)}")