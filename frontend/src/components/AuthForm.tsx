import { useState } from "react";

interface AuthFormProps {
  onAuth: (email: string, password: string, isSignUp: boolean, name?: string) => void;
  isSignUp: boolean;
  setIsSignUp: (val: boolean) => void;
}

export default function AuthForm({ onAuth, isSignUp, setIsSignUp }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const inputStyle = { padding: "14px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "1rem" };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "20px", backgroundColor: "#f9f9f9" }}>
      <h1 style={{ color: "#333" }}>❤️ {isSignUp ? "회원가입" : "투두메이트 로그인"}</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "350px", padding: "30px", backgroundColor: "white", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        {isSignUp && <input type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />}
        <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        {isSignUp && <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />}
        <button 
          onClick={() => onAuth(email, password, isSignUp, name)} 
          style={{ padding: "14px", backgroundColor: "#333", color: "white", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "bold", marginTop: "10px" }}
        >
          {isSignUp ? "가입하기" : "로그인"}
        </button>
        <p onClick={() => setIsSignUp(!isSignUp)} style={{ textAlign: "center", cursor: "pointer", color: "#888", fontSize: "0.9rem", marginTop: "10px" }}>
          {isSignUp ? "이미 계정이 있으신가요? 로그인" : "처음이신가요? 회원가입"}
        </p>
      </div>
    </div>
  );
}