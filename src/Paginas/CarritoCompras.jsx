import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";
import "../App.css";

const CarritoCompras = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [carrito, setCarrito] = useState(null);
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarCarrito = async () => {
    if (!user || !user.id) {
      alert("Debes iniciar sesión para ver tu carrito.");
      navigate("/login");
      return;
    }

    try {
      setCargando(true);

      const respuesta = await fetch(`http://localhost:3000/api/carrito/${user.id}`);
      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "No se pudo cargar el carrito.");
        return;
      }

      setCarrito(data);
      setItems(data.ItemCarritos || []);
    } catch (error) {
      console.error("Error al cargar carrito:", error);
      alert("No se pudo conectar con el backend.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCarrito();
  }, []);

  const aumentarCantidad = async (item) => {
    await actualizarCantidad(item.id, item.cantidad + 1);
  };

  const disminuirCantidad = async (item) => {
    await actualizarCantidad(item.id, item.cantidad - 1);
  };

  const actualizarCantidad = async (itemId, nuevaCantidad) => {
    try {
      const respuesta = await fetch(`http://localhost:3000/api/carrito/item/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cantidad: nuevaCantidad
        })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "No se pudo actualizar el carrito.");
        return;
      }

      cargarCarrito();
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      alert("No se pudo conectar con el backend.");
    }
  };

  const eliminarItem = async (itemId) => {
    try {
      const respuesta = await fetch(`http://localhost:3000/api/carrito/item/${itemId}`, {
        method: "DELETE"
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "No se pudo eliminar el producto.");
        return;
      }

      cargarCarrito();
    } catch (error) {
      console.error("Error al eliminar item:", error);
      alert("No se pudo conectar con el backend.");
    }
  };

  const vaciarCarrito = async () => {
    if (!user || !user.id) return;

    const confirmar = confirm("¿Seguro que deseas vaciar el carrito?");

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`http://localhost:3000/api/carrito/usuario/${user.id}`, {
        method: "DELETE"
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "No se pudo vaciar el carrito.");
        return;
      }

      cargarCarrito();
    } catch (error) {
      console.error("Error al vaciar carrito:", error);
      alert("No se pudo conectar con el backend.");
    }
  };

  const volverDashboard = () => {
    navigate("/dashboard");
  };

  const totalProductos = items.reduce((total, item) => {
    return total + item.cantidad;
  }, 0);

  const totalPagar = Number(carrito?.total || 0);

  return (
    <div className="pagina-dashboard">
      <header className="barra-superior">
        <div>
          <h1>EcoMarket</h1>
          <p>Compra productos sostenibles de forma fácil y segura</p>
        </div>

        <button className="boton-carrito" onClick={volverDashboard}>
          Volver al dashboard
        </button>
      </header>

      <main className="contenedor-usuario">
        <section className="contenido-tienda">
          <section className="seccion-panel">
            <h2>Productos en el carrito</h2>

            {cargando ? (
              <p>Cargando carrito...</p>
            ) : items.length === 0 ? (
              <p className="mensaje-sin-productos">
                Tu carrito está vacío.
              </p>
            ) : (
              <div className="lista-carrito">
                {items.map((item) => (
                  <div className="item-carrito" key={item.id}>
                    <div>
                      <h3>{item.Producto?.nombre}</h3>

                      <p>
                        Precio unitario:{" "}
                        <strong>
                          ${Number(item.precioUnitario).toLocaleString()}
                        </strong>
                      </p>

                      <p>
                        Cantidad: <strong>{item.cantidad}</strong>
                      </p>
                    </div>
                    <div className="acciones-carrito">
                    <h3 className="precio-item-carrito">
                        ${Number(item.total).toLocaleString()}
                    </h3>

                    <div className="botones-cantidad-carrito">
                        <button
                        className="boton-cantidad-carrito"
                        onClick={() => disminuirCantidad(item)}
                        >
                        -
                        </button>

                        <button
                        className="boton-cantidad-carrito"
                        onClick={() => aumentarCantidad(item)}
                        >
                        +
                        </button>
                    </div>

                    <button
                        className="boton-eliminar-item-carrito"
                        onClick={() => eliminarItem(item.id)}
                    >
                        Eliminar
                    </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>

        <aside className="panel-cuenta">
          <h2>Resumen</h2>

          <p>Total de productos: {totalProductos}</p>

          <h3>
            Total a pagar: ${totalPagar.toLocaleString()}
          </h3>

          <button className="boton-agregar">
            Proceder al pago
          </button>

          <button className="boton-cerrar-sesion" onClick={vaciarCarrito}>
            Vaciar carrito
          </button>
        </aside>
      </main>
    </div>
  );
};

export default CarritoCompras;