"use client";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css";
import { createClient } from "@supabase/supabase-js";

// 분리한 컴포넌트 및 설정 임포트
import { API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from "../config/constants";
import AuthForm from "../components/AuthForm";
import AIAnalyzer from "../components/AIAnalyzer";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Category { id: number; title: string; color: string; }
interface Todo { id: number; category_id: number; content: string; is_done: boolean; }

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [date, setDate] = useState<Date>(new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [newCatTitle, setNewCatTitle] = useState("");
  const [newCatColor, setNewCatColor] = useState("#87CEEB");

  const [aiReply, setAiReply] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const formattedDate = format(date, "yyyy-MM-dd");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setUserRole("user");
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setUserRole(data.role);
  };

  useEffect(() => {
    if (session) {
      fetchCategories();
      fetchTodos();
    }
  }, [session, date]);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${session?.access_token}`
  });

  const fetchCategories = async () => {
    const res = await fetch(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() });
    const data = await res.json();
    setCategories(data);
  };

  const fetchTodos = async () => {
    const res = await fetch(`${API_BASE_URL}/todos?date=${formattedDate}`, { headers: getAuthHeaders() });
    const data = await res.json();
    setTodos(data);
  };

  const handleAuth = async (email: string, password: string, isSignUp: boolean, name?: string) => {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } }
      });
      if (error) alert(error.message);
      else alert("가입 성공! 로그인을 진행해주세요.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatTitle.trim()) return;
    await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title: newCatTitle, color: newCatColor }),
    });
    setNewCatTitle("");
    fetchCategories();
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`${API_BASE_URL}/categories/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    fetchCategories();
  };

  const handleAddTodo = async (categoryId: number) => {
    if (!inputContent.trim()) return;
    await fetch(`${API_BASE_URL}/todos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ category_id: categoryId, content: inputContent, date: formattedDate }),
    });
    setInputContent("");
    setActiveCategoryId(null);
    fetchTodos();
  };

  const toggleTodo = async (todoId: number, currentStatus: boolean) => {
    await fetch(`${API_BASE_URL}/todos/${todoId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_done: !currentStatus }),
    });
    fetchTodos();
  };

  const deleteTodo = async (todoId: number) => {
    if(confirm("삭제하시겠습니까?")) {
      await fetch(`${API_BASE_URL}/todos/${todoId}`, { method: "DELETE", headers: getAuthHeaders() });
      fetchTodos();
    }
  };

  if (!session) {
    return <AuthForm onAuth={handleAuth} isSignUp={isSignUp} setIsSignUp={setIsSignUp} />;
  }

  return (
    <main style={{ display: "flex", height: "100vh", fontFamily: "'Pretendard', sans-serif" }}>
      <style>{`
        .react-calendar { width: 100%; border: none; font-family: inherit; }
        .react-calendar__navigation { margin-bottom: 20px; }
        .react-calendar__navigation button { font-size: 1.5rem; font-weight: bold; border-radius: 10px; }
        .react-calendar__tile { padding: 2em 0.5em; font-size: 1.3rem; border-radius: 15px; transition: 0.2s; }
        .react-calendar__tile--active { background-color: #333 !important; color: white !important; }
        .react-calendar__tile--now { background-color: #f0f4ff !important; color: #4f46e5 !important; font-weight: bold !important; border: 1px solid #d1d9ff !important; }
      `}</style>

      {/* 왼쪽 달력 및 AI 섹션 */}
      <div style={{ flex: 1, padding: "40px", borderRight: "1px solid #eee", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>👋 {session.user.user_metadata.full_name || "사용자"}님</span>
          {userRole === 'admin' && <span style={{ fontSize: "0.75rem", padding: "4px 8px", backgroundColor: "#333", color: "#fff", borderRadius: "5px" }}>DEVELOPER</span>}
        </div>
        
        <Calendar onChange={(value) => setDate(value as Date)} value={date} formatDay={(locale, date) => format(date, "d")} />
        
        <AIAnalyzer 
          todos={todos}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
          aiReply={aiReply}
          setAiReply={setAiReply}
          getAuthHeaders={getAuthHeaders}
        />

        {userRole === 'admin' && (
          <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f0f0f0", borderRadius: "10px" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: "10px" }}>🛠️ 관리자 도구</p>
            <button style={{ width: "100%", padding: "8px", fontSize: "0.8rem", cursor: "pointer" }}>전체 유저 통계 보기</button>
          </div>
        )}

        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: "auto", padding: "10px", color: "#888", background: "none", border: "none", cursor: "pointer" }}>로그아웃</button>
      </div>

      {/* 오른쪽 투두 리스트 섹션 */}
      <div style={{ flex: 1, padding: "40px", backgroundColor: "#f9f9f9", overflowY: "auto" }}>
        <div style={{ marginBottom: "30px", display: "flex", gap: "10px", alignItems: "center" }}>
          <input type="text" placeholder="새 카테고리..." value={newCatTitle} onChange={(e) => setNewCatTitle(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }} />
          <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} style={{ width: "40px", height: "40px", border: "none", cursor: "pointer", background: "none" }} />
          <button onClick={handleAddCategory} style={{ padding: "10px 20px", backgroundColor: "#333", color: "white", borderRadius: "10px", border: "none", cursor: "pointer" }}>추가</button>
        </div>

        <h1 style={{ fontSize: "2.2rem", marginBottom: "25px", fontWeight: "bold" }}>{format(date, "yyyy년 M월 d일")}</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {categories.map((cat) => (
            <div key={cat.id} style={{ backgroundColor: "white", padding: "25px", borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "18px" }}>
                <span style={{ backgroundColor: cat.color, padding: "8px 18px", borderRadius: "25px", color: "white", fontWeight: "bold", fontSize: "1.2rem" }}>{cat.title}</span>
                <button onClick={() => handleDeleteCategory(cat.id)} style={{ marginLeft: "12px", color: "#bbacac", background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem" }}>🗑️</button>
                <button onClick={() => setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)} style={{ marginLeft: "auto", border: "none", background: "none", fontSize: "1.8rem", cursor: "pointer", color: "#aaa" }}>{activeCategoryId === cat.id ? "➖" : "➕"}</button>
              </div>

              {activeCategoryId === cat.id && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
                  <input autoFocus placeholder="할 일 입력..." value={inputContent} onChange={(e) => setInputContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTodo(cat.id)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #ddd" }} />
                  <button onClick={() => handleAddTodo(cat.id)} style={{ padding: "0 25px", backgroundColor: cat.color, color: "white", border: "none", borderRadius: "12px", cursor: "pointer" }}>확인</button>
                </div>
              )}

              <ul style={{ listStyle: "none", padding: 0 }}>
                {todos.filter(t => t.category_id === cat.id).map(todo => (
                  <li key={todo.id} style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f5f5f5" }}>
                    <div onClick={() => toggleTodo(todo.id, todo.is_done)} style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: todo.is_done ? cat.color : "#eee", marginRight: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>{todo.is_done && "✔"}</div>
                    <span style={{ textDecoration: todo.is_done ? "line-through" : "none", color: todo.is_done ? "#aaa" : "#333", flex: 1, fontSize: "1.25rem" }}>{todo.content}</span>
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