# ❤️ 커플 일정 공유 앱

## 🚀 실행 방법
### 백엔드 (Backend)
1. `cd backend`
2. `.\venv\Scripts\activate`
3. `uvicorn app.main:app --reload`

### 프론트엔드 (Frontend)
1. `cd frontend`
2. `npm run dev`

## 🛠 깃허브 업로드 명령어
1. `git init`
2. `git add .`
3. `git commit -m "작업 내용"`
4. `git push origin main`

frontend/src
├── app          # Next.js App Router 기반의 페이지 및 레이아웃
├── components   # 재사용 가능한 UI 컴포넌트 (AuthForm, AIAnalyzer 등)
├── config       # API 주소 및 환경 설정 상수 관리
└── public       # 이미지, 파비콘 등 정적 파일

backend/app
├── api          # 기능별 API 엔드포인트 분리 (categories, todos)
├── auth.py      # Supabase 기반 사용자 인증 로직 (Dependency)
├── database.py  # Supabase 및 Gemini API 초기화 설정
├── main.py      # FastAPI 앱 실행 및 라우터 통합 컨트롤 타워
└── models.py    # Pydantic을 이용한 데이터 요청/응답 규격(Schema) 정의