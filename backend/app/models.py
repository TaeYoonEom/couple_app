#데이터 규격을 정의
from pydantic import BaseModel
from typing import List

class TodoCreate(BaseModel):
    category_id: int
    content: str
    date: str

class TodoAnalyzeRequest(BaseModel):
    todos: List[dict]

class AIPrompt(BaseModel):
    message: str