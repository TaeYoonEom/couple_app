#DB 연결과 제미나이 설정
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai

# 현재 파일(database.py)의 부모의 부모 폴더(backend)에 있는 .env 찾기
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL 또는 KEY가 설정되지 않았습니다. .env 파일을 확인하세요.")

# 클라이언트 초기화
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 제미나이 설정
genai.configure(api_key=GEMINI_API_KEY)