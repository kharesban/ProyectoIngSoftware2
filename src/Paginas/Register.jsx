import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../Styles/Login.module.css";
import logoEco from "../assets/logo-ecomart.png";

function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contra, setContra] = useState("");
  const [contraV, setContraV] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const validateForm = () => {
    if (nombre.trim() === "") {
      setError("El nombre es requerido");
      return false;
    }

    if (email.trim() === "") {
      setError("El email es requerido");
      return false;
    }

    if (!email.includes("@")) {
      setError("Ingresa un email válido");
      return false;
    }

    if (contra.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (contra !== contraV) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    setError("");

    if (!validateForm()) return;

    try {
      const respuesta = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: nombre,
          email: email,
          password: contra
        })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.error || "No se pudo registrar el usuario.");
        return;
      }

      alert("Usuario registrado exitosamente");
      navigate("/login");

    } catch (error) {
      console.error("Error en registro:", error);
      setError("No se pudo conectar con el servidor.");
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
        <h2>Registro de nuevo usuario</h2>

        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Ingresa tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={contraV}
            onChange={(e) => setContraV(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: "red", textAlign: "center", margin: "10px 0" }}>
            {error}
          </p>
        )}

        <button onClick={handleRegister}>Crear cuenta</button>

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

export default Register;