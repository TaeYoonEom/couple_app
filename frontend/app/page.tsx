"use client"; // 브라우저에서 실행되는 코드임을 선언
import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("백엔드 연결 시도 중...");

  useEffect(() => {
    // 백엔드(FastAPI) 서버 주소로 요청을 보냅니다.
    fetch("http://127.0.0.1:8000/")
      .then((res) => {
        if (!res.ok) throw new Error("네트워크 응답에 문제가 있습니다.");
        return res.json();
      })
      .then((data) => {
        setMessage(data.message); // 백엔드에서 받은 메시지로 변경
      })
      .catch((error) => {
        console.error("에러 발생:", error);
        setMessage("백엔드 서버가 켜져 있는지 확인해주세요!");
      });
  }, []);

  return (
    <main style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh",
      fontFamily: "sans-serif"
    }}>
      <h1 style={{ color: "#ff4b5c" }}>❤️ 커플 일정 공유 앱</h1>
      <div style={{ 
        padding: "20px", 
        borderRadius: "10px", 
        backgroundColor: "#f0f0f0",
        marginTop: "20px"
      }}>
        <p>백엔드 신호: <strong>{message}</strong></p>
      </div>
    </main>
  );
}