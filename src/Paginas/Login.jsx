import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";
import styles from "../Styles/Login.module.css";
import logoEco from "../assets/logo-ecomart.png";

function Login() {
  const [user, setUser] = useState("");
  const [contra, setContra] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (user.trim() === "" || contra.trim() === "") {
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

      const usuarioLogueado = data.usuario || data;

      login(usuarioLogueado);
      navigate("/dashboard");

    } catch (error) {
      console.error("Error en login:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className={styles.loginFondo}>
      
      <div className={styles.welcomeSection}>
        <img src={logoEco} alt="Logo EcoMart" className={styles.logo} />
        <h1>Bienvenidos a EcoMart</h1>
        <p>Tu tienda ecológica para un consumo más responsable.</p>
      </div>

      <div className={styles.loginContainer}>
        <h2>Login</h2>

        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email"
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

        <button onClick={handleLogin}>Ingresar</button>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          ¿No tienes una cuenta?{" "}
          <Link to="/register" style={{ color: "#007bff" }}>
            Regístrate aquí
          </Link>
        </p>
      </div>

    </div>
  );
}

export default Login;
