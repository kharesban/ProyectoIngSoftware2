import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Carrito = () => {
    const navigate = useNavigate();

    const [productosCarrito, setProductosCarrito] = useState(() => {
        const carritoGuardado = localStorage.getItem("carritoEcoMarket");
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    });

    const total = productosCarrito.reduce(
        (acc, item) => acc + item.precio * item.cantidad,
        0
    );

    const aumentarCantidad = (id) => {
        const nuevoCarrito = productosCarrito.map((item) =>
            item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
        );

        setProductosCarrito(nuevoCarrito);
        localStorage.setItem("carritoEcoMarket", JSON.stringify(nuevoCarrito));
    };

    const disminuirCantidad = (id) => {
        const nuevoCarrito = productosCarrito
        .map((item) =>
            item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter((item) => item.cantidad > 0);

        setProductosCarrito(nuevoCarrito);
        localStorage.setItem("carritoEcoMarket", JSON.stringify(nuevoCarrito));
    };

    const eliminarProducto = (id) => {
        const nuevoCarrito = productosCarrito.filter((item) => item.id !== id);

        setProductosCarrito(nuevoCarrito);
        localStorage.setItem("carritoEcoMarket", JSON.stringify(nuevoCarrito));
    };

    const vaciarCarrito = () => {
        setProductosCarrito([]);
        localStorage.removeItem("carritoEcoMarket");
    };

    const pagarCarrito = () => {
        if (productosCarrito.length === 0) {
            alert("El carrito está vacío.");
            return;
        }

        alert("Compra realizada exitosamente.");
        vaciarCarrito();
        navigate("/dashboard");
    };

    return (
        <div className="pagina-carrito">
            <header className="barra-superior">
                <div>
                    <h1>EcoMarket</h1>
                    <p>Compra productos sostenibles de forma fácil y segura</p>
                </div>

                <button className="boton-secundario" onClick={() => navigate("/dashboard")}>
                    Volver al dashboard
                </button>
            </header>

            <main className="contenedor-carrito">
                <section className="seccion-panel">
                    <h2>Productos en el carrito</h2>
                        {productosCarrito.length === 0 ? (
                            <p>No tienes productos en el carrito.</p>
                        ) : (
                            <div className="lista-carrito">

                                {productosCarrito.map((producto) => (
                                    <div key={producto.id} className="producto-carrito">
                                        <div>
                                            <h3>{producto.nombre}</h3>
                                            <p>{producto.categoria}</p>
                                            <p>Precio unitario: <strong>${producto.precio}</strong></p>
                                            <p>Cantidad: {producto.cantidad}</p>
                                        </div>

                                        <div className="acciones-carrito">
                                            <strong>${producto.precio * producto.cantidad}</strong>

                                            <div className="botones-cantidad">
                                                <button onClick={() => disminuirCantidad(producto.id)}>
                                                    -
                                                </button>
                                                <button onClick={() => aumentarCantidad(producto.id)}>
                                                    +
                                                </button>
                                            </div>

                                            <button className="boton-eliminar" onClick={() => eliminarProducto(producto.id)}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </section>

                <aside className="resumen-carrito">
                    <h3>Resumen</h3>
                    <p>Total de productos: {productosCarrito.length}</p>
                    <p className="total-carrito">Total a pagar: ${total}</p>

                    <button className="boton-principal" onClick={pagarCarrito}>
                        Proceder al pago
                    </button>

                    <button className="boton-vaciar" onClick={vaciarCarrito}>
                        Vaciar carrito
                    </button>
                </aside>
            </main>
        </div>
    );
};

export default Carrito;