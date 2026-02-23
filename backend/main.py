from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 프론트엔드(Next.js) 주소 허용 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 나중에는 실제 배포 주소만 넣어야 하지만, 지금은 테스트용으로 전체 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "백엔드에서 보내는 커플 앱 메시지!"}