from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import categories, todos
from .database import SUPABASE_URL

app = FastAPI()

# CORS 설정
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(todos.router, prefix="/todos", tags=["Todos"])

@app.get("/")
async def root():
    return {"message": "Couple App API is running", "db_check": SUPABASE_URL}