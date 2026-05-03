import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./Rutas/PrivateRoute";
import Login from "./Paginas/Login";
import Register from "./Paginas/Register";
import Dashboard from "./Paginas/dashboard";
import Carrito from "./Paginas/CarritoCompras";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" 
        element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route path="/carrito"
          element={
            <PrivateRoute>
              <Carrito />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;