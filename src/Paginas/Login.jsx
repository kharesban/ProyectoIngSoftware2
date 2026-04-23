import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";
import styles from "../Styles/Login.module.css";

function Login() {
  const [user, setUser] = useState("");
  const [contra, setContra] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    // Validar que haya datos
    if (!user || !contra) {
      setError("Por favor complete todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Llamar al backend real
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: user,      // El email que escribió el usuario
          contraseña: contra  // La contraseña que escribió
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ¡SOLO ESTO CAMBIA! - Usar el login real del contexto
        login(data.user);  // data.user tiene { id, nombre, correo }
        navigate("/dashboard");
      } else {
        setError(data.error || "Email o contraseña incorrecta");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión con el servidor. ¿Está corriendo el backend?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginFondo}>
        <h1>Bienvenidos a EcoMart</h1>

        <div className={styles.loginContainer}> 
            <h2>Login</h2>

            {error && (
              <div style={{
                background: "#f8d7da",
                color: "#721c24",
                padding: "10px",
                borderRadius: "5px",
                marginBottom: "15px",
                textAlign: "center"
              }}>
                {error}
              </div>
            )}

            <div className={styles.inputGroup}>
                <input
                    type="email"
                    placeholder="Email"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className={styles.inputGroup}>
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={contra}
                    onChange={(e) => setContra(e.target.value)}
                    disabled={loading}
                />
            </div>

            <button onClick={handleLogin} disabled={loading}>
                {loading ? "Cargando..." : "Ingresar"}
            </button>
        </div>
    </div>
  );
}

export default Login;