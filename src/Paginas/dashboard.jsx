import { useContext } from "react";
import { AuthContext } from "../Context/MyContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();        // 🔥 limpia el usuario
    navigate("/");   // redirige al login
  };

  return (
    <div>
      <h1>Bienvenido {user?.user}</h1>

      <button onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
}

export default Dashboard;