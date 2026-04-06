import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./MyContext";
import styles from "./Login.module.css";

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

    if (user === "admin" && contra === "123") {
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

            <button onClick={handleLogin}>
                Ingresar
            </button>
        </div>
    </div>
  );
}

export default Login;