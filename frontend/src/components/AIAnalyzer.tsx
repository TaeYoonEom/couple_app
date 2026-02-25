import { useState, useEffect } from "react"; // ✨ 타이핑 효과를 위해 useEffect 추가
import { API_BASE_URL } from "../config/constants";

interface AIAnalyzerProps {
  todos: any[];
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
  aiReply: string;
  setAiReply: (val: string) => void;
  getAuthHeaders: () => any;
}

export default function AIAnalyzer({ 
  todos, isAnalyzing, setIsAnalyzing, aiReply, setAiReply, getAuthHeaders 
}: AIAnalyzerProps) {
  
  // ✨ 실제로 화면에 보여줄 텍스트 상태
  const [displayText, setDisplayText] = useState("");

  // ✨ AI 답변이 새로 올 때마다 타이핑 효과를 실행하는 로직
  useEffect(() => {
    setDisplayText(""); // 답변이 오면 일단 초기화
    
    if (aiReply) {
      let index = 0;
      const interval = setInterval(() => {
        // 한 글자씩 가져와서 상태에 추가
        setDisplayText((prev) => prev + aiReply.charAt(index));
        index++;
        
        // 글자를 모두 다 썼으면 인터벌 종료
        if (index >= aiReply.length) {
          clearInterval(interval);
        }
      }, 25); // ✨ 25ms 간격 (속도가 너무 빠르면 숫자를 키우세요)

      return () => clearInterval(interval); // 컴포넌트가 사라질 때 정리
    }
  }, [aiReply]);

  const handleAnalyzeTodos = async () => {
    if (todos.length === 0) return alert("분석할 할 일이 없습니다.");
    
    setIsAnalyzing(true);
    setAiReply(""); // ✨ 새로운 요청 시 이전 답변 초기화
    
    try {
      const res = await fetch(`${API_BASE_URL}/todos/analyze`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ todos }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setAiReply(data.reply);
      } else {
        alert(data.detail || "AI 분석 중 오류가 발생했습니다.");
      }
    } catch (error) {
      alert("AI 분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#f0f4ff", borderRadius: "15px", border: "1px solid #d1d9ff" }}>
      <button 
        onClick={handleAnalyzeTodos} 
        disabled={isAnalyzing}
        style={{ 
          width: "100%", padding: "12px", backgroundColor: "#4f46e5", color: "white", 
          borderRadius: "10px", border: "none", cursor: isAnalyzing ? "not-allowed" : "pointer",
          fontWeight: "bold", transition: "0.3s"
        }}
      >
        {isAnalyzing ? "AI 분석 중..." : "✨ AI 일정 분석 받기"}
      </button>

      {/* ✨ 분석 중이거나 결과가 있을 때 박스 표시 */}
      {(isAnalyzing || displayText) && (
        <div style={{ 
          marginTop: "15px", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-wrap", 
          color: "#374151", backgroundColor: "white", padding: "15px", borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          minHeight: "50px"
        }}>
          {isAnalyzing && !displayText ? (
            <span style={{ color: "#888" }}>제미나이가 일정을 분석하고 있습니다...</span>
          ) : (
            displayText
          )}
        </div>
      )}
    </div>
  );
}