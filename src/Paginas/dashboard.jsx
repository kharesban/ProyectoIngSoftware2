import { useContext } from "react";
import { AuthContext } from "../Context/MyContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="pagina-dashboard">

      {/* 🔹 Barra superior */}
      <div className="barra-superior">
        <div>
          <h1>EcoMart</h1>
          <p>Bienvenido {user?.user}</p>
        </div>

        <button 
          className="boton-cerrar-sesion"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>

      {/* 🔹 Contenido principal */}
      <div className="contenedor-usuario">

        <div className="contenido-tienda">
          <div className="seccion-bienvenida">
            <h2>¡Bienvenido!</h2>
            <p>
              Has iniciado sesión correctamente. Aquí podrás ver productos,
              gestionar tu carrito y más.
            </p>
          </div>

          <div className="seccion-panel">
            <h2>Panel principal</h2>
            <p>Aquí irá el contenido dinámico (productos desde la BD).</p>
          </div>
        </div>

        {/* 🔹 Panel lateral */}
        <div className="panel-cuenta">
          <h2>Cuenta</h2>
          <div className="caja-sesion">
            <p><strong>Usuario:</strong> {user?.user}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;