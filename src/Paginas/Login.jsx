import { useState, useContext } from "react";
import { useNavigate,Link } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";
import styles from "../Styles/Login.module.css";

function Login() {
  const [user, setUser] = useState("");
  const [contra, setContra] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = () => {
    const fakeUser = {
      user: user,
      contra: contra
    };

    if (user === "admin" && contra === "123") { //cambiar para que se maneje con sql
      login(fakeUser);
      navigate("/dashboard");
    } else {
      alert("Email o contraseña incorrecta.");
      return;
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
                    placeholder="Usuario"
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
              <Link 
                to="/registro" 
                style={{ color: "#007bff"}}> Regístrate aquí
              </Link>
            </p>
        </div>
    </div>
  );
}

export default Login;