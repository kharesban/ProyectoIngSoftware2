import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./Rutas/PrivateRoute";
import Login from "./Paginas/Login";
import Menu from "./Paginas/dashboard";


function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Menu />
            </PrivateRoute>
          } 
        />

      </Routes>
      
    </Router>
  );
}

export default App;