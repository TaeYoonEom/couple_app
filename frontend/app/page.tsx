"use client";
import { useEffect, useState } from "react";

interface Schedule {
  id?: number;
  title: string;
  date: string;
  content: string;
}

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [issubmitting, setIsSubmitting] = useState(false); // 저장 중복 방지

  const fetchSchedules = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/schedules");
      const data = await res.json();
      setSchedules(data);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // trim()을 써서 공백만 입력된 경우도 걸러냅니다.
    const cleanTitle = title.trim();
    const cleanDate = date;

    if (!cleanTitle || !cleanDate) {
      return alert("제목과 날짜를 정확히 입력해주세요! ✍️");
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cleanTitle, date: cleanDate, content: content }),
      });

      if (res.ok) {
        alert("일정이 저장되었습니다! ❤️");
        setTitle(""); setDate(""); setContent(""); 
        await fetchSchedules(); 
      }
    } catch (error) {
      alert("백엔드 서버와 연결할 수 없습니다. 서버가 켜져있나요?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#ff4b5c", textAlign: "center" }}>❤️ 우리들의 일정장</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px", border: "1px solid #eee", borderRadius: "10px" }}>
        <input type="text" placeholder="일정 제목" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: "10px" }} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: "10px" }} />
        <textarea placeholder="메모할 내용" value={content} onChange={(e) => setContent(e.target.value)} style={{ padding: "10px", height: "60px" }} />
        <button 
          type="submit" 
          disabled={issubmitting}
          style={{ 
            padding: "10px", 
            backgroundColor: issubmitting ? "#ccc" : "#ff4b5c", 
            color: "white", border: "none", borderRadius: "5px", cursor: issubmitting ? "not-allowed" : "pointer" 
          }}
        >
          {issubmitting ? "저장 중..." : "일정 저장하기"}
        </button>
      </form>

      <hr style={{ margin: "30px 0", border: "0.5px solid #eee" }} />

      <h2>🗓️ 다가오는 일정</h2>
      {loading ? <p>불러오는 중...</p> : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {schedules.length === 0 && <p>등록된 일정이 없어요.</p>}
          {schedules.map((s, index) => (
            <li key={index} style={{ padding: "15px", borderBottom: "1px solid #f0f0f0" }}>
              <strong>{s.date}</strong> - {s.title}
              <p style={{ fontSize: "0.9rem", color: "#666" }}>{s.content}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}