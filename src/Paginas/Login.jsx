import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";
import styles from "../Styles/Login.module.css";

function Login() {
  const [user, setUser] = useState("");
  const [contra, setContra] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (user === "" || contra === "") {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const respuesta = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: user,
          password: contra
        })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "Email o contraseña incorrecta.");
        return;
      }

      login(data);
      navigate("/dashboard");

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className={styles.loginFondo}>
      <h1>Bienvenidos a EcoMart</h1>

      <div className={styles.loginContainer}>
        <h2>Login</h2>

        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Contraseña"
            value={contra}
            onChange={(e) => setContra(e.target.value)}
          />
        </div>

        <button onClick={handleLogin}>
          Ingresar
        </button>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          ¿No tienes una cuenta?{" "}
          <Link to="/registro" style={{ color: "#007bff" }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;