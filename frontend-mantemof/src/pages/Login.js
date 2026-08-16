import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    const data = await login(email, password);

    console.log("DATA:", data);

    if (data && data.token) {
      // 🔐 guardar token
      localStorage.setItem("token", data.token);

      // 👤 guardar usuario
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("LOGIN OK");

      // 🚀 redirigir
      navigate("/dashboard");

    } else {
      alert("Error en login");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Ingresar</button>
    </div>
  );
}

export default Login;