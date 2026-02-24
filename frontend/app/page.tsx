"use client";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css"; 

/**
 * [인터페이스 정의]
 * 데이터 구조를 명확히 하기 위한 타입 설정
 */
interface Category {
  id: number;
  title: string;
  color: string;
}
interface Todo {
  id: number;
  category_id: number;
  content: string;
  is_done: boolean;
}

export default function Home() {
  /**
   * [상태 관리 변수]
   * 달력 날짜, 카테고리 목록, 할 일 목록 및 입력값 관리
   */
  const [date, setDate] = useState<Date>(new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  
  // 카테고리 추가를 위한 상태 (이름 및 색상)
  const [newCatTitle, setNewCatTitle] = useState("");
  const [newCatColor, setNewCatColor] = useState("#87CEEB"); // 기본 색상: 하늘색

  const formattedDate = format(date, "yyyy-MM-dd");

  /**
   * [데이터 로드 처리]
   * 화면 시작 시 카테고리를 불러오고, 날짜가 바뀔 때마다 할 일을 불러옴
   */
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [date]);

  /**
   * [API 통신 함수들]
   * 서버(FastAPI)와 통신하여 데이터를 주고받는 기능
   */
  const fetchCategories = async () => {
    const res = await fetch("http://127.0.0.1:8000/categories");
    const data = await res.json();
    setCategories(data);
  };

  const fetchTodos = async () => {
    const res = await fetch(`http://127.0.0.1:8000/todos?date=${formattedDate}`);
    const data = await res.json();
    setTodos(data);
  };

  // 📂 카테고리 추가 (선택한 색상 포함)
  const handleAddCategory = async () => {
    if (!newCatTitle.trim()) return alert("카테고리 이름을 입력하세요!");
    await fetch("http://127.0.0.1:8000/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title: newCatTitle, 
        color: newCatColor // 사용자가 선택한 색상 전송
      }),
    });
    setNewCatTitle("");
    setNewCatColor("#87CEEB"); // 색상 초기화
    fetchCategories();
  };

  // 🗑️ 카테고리 삭제
  const handleDeleteCategory = async (id: number) => {
    if (!confirm("이 카테고리를 삭제하시겠습니까? 안의 모든 할 일도 사라집니다.")) return;
    await fetch(`http://127.0.0.1:8000/categories/${id}`, { method: "DELETE" });
    fetchCategories();
    fetchTodos();
  };

  // 📝 할 일(Todo) 추가
  const handleAddTodo = async (categoryId: number) => {
    if (!inputContent.trim()) return;
    await fetch("http://127.0.0.1:8000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_id: categoryId, content: inputContent, date: formattedDate }),
    });
    setInputContent("");
    setActiveCategoryId(null);
    fetchTodos();
  };

  // ✅ 할 일 완료 토글
  const toggleTodo = async (todoId: number, currentStatus: boolean) => {
    await fetch(`http://127.0.0.1:8000/todos/${todoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: !currentStatus }),
    });
    fetchTodos();
  };

  // 🗑️ 할 일 삭제
  const deleteTodo = async (todoId: number) => {
    if(confirm("정말 삭제하시겠습니까?")) {
      await fetch(`http://127.0.0.1:8000/todos/${todoId}`, { method: "DELETE" });
      fetchTodos();
    }
  };

  /**
   * [UI 렌더링 영역]
   */
  return (
    <main style={{ display: "flex", height: "100vh", fontFamily: "'Pretendard', sans-serif" }}>
      
      {/* 🎨 전역 스타일 및 달력 커스텀 스타일 */}
      <style>{`
        .react-calendar { width: 100%; border: none; font-family: inherit; }
        .react-calendar__navigation { margin-bottom: 20px; }
        .react-calendar__navigation button { font-size: 1.5rem; font-weight: bold; border-radius: 10px; }
        .react-calendar__tile { padding: 2em 0.5em; font-size: 1.3rem; border-radius: 15px; transition: 0.2s; }
        .react-calendar__tile--active { background-color: #333 !important; color: white !important; }

        /* 🌟 [수정 부분] 오늘 날짜 표시: 빨간색 대신 푸른색(Indigo) 계열로 변경 */
        .react-calendar__tile--now { 
          background-color: #f0f4ff !important; /* 아주 연한 파란색 배경 */
          color: #4f46e5 !important;           /* 세련된 인디고 블루 글자색 */
          font-weight: bold !important;
          border: 1px solid #d1d9ff !important; /* 살짝 강조되는 테두리 */
        }

        /* 주말(토, 일) 빨간색 설정이 오늘 날짜와 겹칠 경우를 대비해 순서 보정 */
        .react-calendar__month-view__days__day--weekend {
          color: #ff4b5c;
        }
      `}</style>

      {/* 🔴 [왼쪽 레이아웃] 달력 섹션 */}
      <div style={{ flex: 1, padding: "40px", borderRight: "1px solid #eee", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
        <Calendar 
          onChange={(value) => setDate(value as Date)} 
          value={date} 
          formatDay={(locale, date) => format(date, "d")}
        />
      </div>

      {/* 🔵 [오른쪽 레이아웃] 일정 섹션 */}
      <div style={{ flex: 1, padding: "40px", backgroundColor: "#f9f9f9", overflowY: "auto" }}>
        
        {/* 🏷️ [수정됨] 카테고리 추가 입력창 및 색상 선택기 */}
        <div style={{ marginBottom: "30px", display: "flex", gap: "10px", alignItems: "center" }}>
          <input 
            type="text" 
            placeholder="새 카테고리 이름 (예: 운동, 공부)" 
            value={newCatTitle}
            onChange={(e) => setNewCatTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "1.1rem" }}
          />
          
          {/* 색상 선택기 추가 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <input 
              type="color" 
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              style={{ width: "40px", height: "40px", border: "none", cursor: "pointer", background: "none" }}
            />
            <span style={{ fontSize: "0.9rem", color: "#202020" }}>카테고리 색</span>
          </div>

          <button 
            onClick={handleAddCategory}
            style={{ padding: "10px 20px", backgroundColor: "#333", color: "white", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}
          >
            카테고리 추가
          </button>
        </div>

        {/* 📅 현재 선택된 날짜 제목 */}
        <h1 style={{ fontSize: "2.2rem", marginBottom: "25px", fontWeight: "bold" }}>
          {format(date, "yyyy년 M월 d일")}
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {categories.map((cat) => (
            <div key={cat.id} style={{ backgroundColor: "white", padding: "25px", borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
              
              {/* 📂 카테고리 헤더 (글자 크기 키움) */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "18px" }}>
                <span style={{ backgroundColor: cat.color, padding: "8px 18px", borderRadius: "25px", color: "white", fontWeight: "bold", fontSize: "1.2rem" }}>
                  {cat.title}
                </span>
                
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  style={{ marginLeft: "12px", border: "none", background: "none", color: "#bbacac", cursor: "pointer", fontSize: "1.0rem" }}
                >
                  삭제
                </button>

                <button 
                  onClick={() => setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)} 
                  style={{ marginLeft: "auto", border: "none", background: "none", fontSize: "1.8rem", cursor: "pointer", color: "#aaa" }}
                >
                  {activeCategoryId === cat.id ? "➖" : "➕"}
                </button>
              </div>

              {/* ✏️ 새로운 할 일 입력창 */}
              {activeCategoryId === cat.id && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="새로운 할 일..." 
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTodo(cat.id)}
                    style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #ddd", fontSize: "1.2rem" }}
                  />
                  <button onClick={() => handleAddTodo(cat.id)} style={{ padding: "0 25px", backgroundColor: cat.color, color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }}>확인</button>
                </div>
              )}

              {/* 📝 개별 일정 목록 (글씨 크기 대폭 확대) */}
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {todos.filter(t => t.category_id === cat.id).map(todo => (
                  <li key={todo.id} style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f5f5f5" }}>
                    <div 
                      onClick={() => toggleTodo(todo.id, todo.is_done)}
                      style={{ 
                        width: "30px", height: "30px", borderRadius: "8px", 
                        backgroundColor: todo.is_done ? cat.color : "#eee",
                        marginRight: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white"
                      }}
                    >
                      {todo.is_done && "✔"}
                    </div>
                    <span style={{ 
                      textDecoration: todo.is_done ? "line-through" : "none", 
                      color: todo.is_done ? "#aaa" : "#333", 
                      flex: 1, 
                      fontSize: "1.25rem", // 👈 일정 글씨 크기 시원하게 확대
                      fontWeight: "400"
                    }}>
                      {todo.content}
                    </span>
                    <button onClick={() => deleteTodo(todo.id)} style={{ border: "none", background: "none", color: "#ddd", cursor: "pointer", fontSize: "1.6rem" }}>🗑️</button>
                  </li>
                ))}
              </ul>

            </div>
          ))}
        </div>
      </div>
    </main>
  );
}