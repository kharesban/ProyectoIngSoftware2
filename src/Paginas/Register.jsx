import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../Styles/Login.module.css";
import logoEco from "../assets/logo-ecomart.png";

function Register() {
  const [user, setUser] = useState("");
  const [contra, setContra] = useState("");
  const [contraV, setContraV] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validatePasswords = () => {
    if (user.trim() === "") {
      setError("El email es requerido");
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

    if (!validatePasswords()) return;

    // ⚠️ TEMPORAL (luego conectar con backend)
    alert("Usuario registrado exitosamente");
    navigate("/login");
  };

  return (
    <div className={styles.loginFondo}>

      {/* Sección izquierda */}
      <div className={styles.welcomeSection}>
        <img src={logoEco} alt="Logo EcoMart" className={styles.logo} />
        <h1>Bienvenidos a EcoMart</h1>
        <p>Tu tienda ecológica para un consumo más responsable.</p>
      </div>

      {/* Formulario */}
      <div className={styles.loginContainer}>
        <h2>Registro de nuevo usuario</h2>

        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Ingresa el Nombre de Usuario"
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

        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Confirmar Contraseña"
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