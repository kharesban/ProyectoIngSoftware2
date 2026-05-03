import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../Styles/Login.module.css";

function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (nombre === "" || email === "" || password === "") {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const respuesta = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: nombre,
          email: email,
          password: password
        })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "No se pudo registrar el usuario.");
        return;
      }

      alert("Usuario registrado correctamente.");
      navigate("/login");

    } catch (error) {
      console.error("Error al registrar:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className={styles.loginFondo}>
      <h1>Registro EcoMart</h1>

      <div className={styles.loginContainer}>
        <h2>Crear cuenta</h2>

        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button onClick={handleRegister}>
          Registrarse
        </button>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" style={{ color: "#007bff" }}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Registro;