@echo off
cd /d "%~dp0"
echo 백엔드(FastAPI) 서버를 켭니다...
call venv\Scripts\activate
uvicorn main:app --reload --port 8000
pause