import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import styles from "../Styles/Login.module.css";

function Register() {
  const [user, setUser] = useState("");
  const [contra,setContra] =useState("");
  const [contraV, setContraV] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validatePasswords = () => {
    if (contra !== contraV) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    if (contra.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (user.trim() === "") {
      setError("El email es requerido");
      return false;
    }
    return true;
  };


  const handleRegister = async() => {
   // Limpiar error anterior
    setError("");
    
    // Validar antes de registrar
    if (!validatePasswords()) {
      return;
    }

    const fakeUser = {
      user: user,
      contra: contra
    };

    alert("Usuario registrado exitosamente"); //faltaria meter el que se guarde el usuario al sql
    navigate("/login");
  
  };

  return (
    <div className={styles.loginFondo}>
      <h1>Bienvenidos a EcoMart</h1>

      <div className={styles.loginContainer}>
        <h2>Registro de nuevo usuario</h2>

        <div className={styles.inputGroup}>
          <input
            type="string"
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

        {/* Mostrar mensaje de error si existe */}
        {error && (
          <p style={{ color: "red", textAlign: "center", margin: "10px 0" }}>
            {error}
          </p>
        )}

        <button onClick={handleRegister}>
          Crear cuenta
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

export default Register;

