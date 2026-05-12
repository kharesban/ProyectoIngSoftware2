import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";
import "../App.css";

import CepilloBambu from "../assets/ImagenesProductos/CepilloBambu.png";
import BotellaReutilizable from "../assets/ImagenesProductos/BotellaReutilizable.png";
import BolsaTela from "../assets/ImagenesProductos/BolsaTela.png";
import PitillosAcero from "../assets/ImagenesProductos/PitillosAcero.png";
import JabonArtesanal from "../assets/ImagenesProductos/JabonArtesanal.png";
import ShampooSolido from "../assets/ImagenesProductos/ShampooSolido.png";
import AcondicionadorSolido from "../assets/ImagenesProductos/AcondicionadorSolido.png";
import DesodoranteNatural from "../assets/ImagenesProductos/DesodoranteNatural.png";
import EsponjaVegetal from "../assets/ImagenesProductos/EsponjaVegetal.png";
import DetergenteEcologico from "../assets/ImagenesProductos/DetergenteEcologico.png";
import LimpiadorMultiusos from "../assets/ImagenesProductos/LimpiadorMultiusos.png";
import CepilloPlatosBambu from "../assets/ImagenesProductos/CepilloPlatosBambu.png";
import PañosReutilizables from "../assets/ImagenesProductos/PañosReutillizables.png";
import EnvoltorioCeraAbeja from "../assets/ImagenesProductos/EnvoltoriosCeraAbeja.png";
import ContenedorVidrio from "../assets/ImagenesProductos/ContenedorVidrio.png";
import MacetaBiodegradable from "../assets/ImagenesProductos/MacetaBiodegradable.png";
import SemillasHuerta from "../assets/ImagenesProductos/SemillasHuerta.png";
import ComposteraDomestica from "../assets/ImagenesProductos/ComposteraDomestica.png";
import CuadernoReciclado from "../assets/ImagenesProductos/CuadernoReciclado.png";
import LapicesReciclados from "../assets/ImagenesProductos/LapicesReciclados.png";
import ProductoEnProceso from "../assets/ImagenesProductos/ProductoEnProceso.png";

const API_PRODUCTOS = "http://localhost:3000/api/productos";

const obtenerImagenProducto = (nombre) => {
  const texto = nombre.toLowerCase();

  if (texto.includes("cepillo") && texto.includes("plato")) return CepilloPlatosBambu;
  if (texto.includes("cepillo")) return CepilloBambu;
  if (texto.includes("botella")) return BotellaReutilizable;
  if (texto.includes("bolsa")) return BolsaTela;
  if (texto.includes("pitillo")) return PitillosAcero;
  if (texto.includes("jabon") || texto.includes("jabón")) return JabonArtesanal;
  if (texto.includes("shampoo")) return ShampooSolido;
  if (texto.includes("acondicionador")) return AcondicionadorSolido;
  if (texto.includes("desodorante")) return DesodoranteNatural;
  if (texto.includes("esponja")) return EsponjaVegetal;
  if (texto.includes("detergente")) return DetergenteEcologico;
  if (texto.includes("limpiador")) return LimpiadorMultiusos;
  if (texto.includes("paño")) return PañosReutilizables;
  if (texto.includes("envoltorio")) return EnvoltorioCeraAbeja;
  if (texto.includes("contenedor")) return ContenedorVidrio;
  if (texto.includes("maceta")) return MacetaBiodegradable;
  if (texto.includes("semilla")) return SemillasHuerta;
  if (texto.includes("compostera")) return ComposteraDomestica;
  if (texto.includes("cuaderno")) return CuadernoReciclado;
  if (texto.includes("lapiz") || texto.includes("lápiz")) return LapicesReciclados;
  if (texto.includes("bolsa") || texto.includes("tela")) return BolsaTela;

  return ProductoEnProceso;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [productos, setProductos] = useState([]);
  const [productoExpandido, setProductoExpandido] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("Todos");

  const [cargando, setCargando] = useState(true);
  const [errorProductos, setErrorProductos] = useState("");

  const [productoEditando, setProductoEditando] = useState(null);

  const [formProducto, setFormProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stockDisponible: "",
    estado: "Disponible",
  });

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setErrorProductos("");

      const respuesta = await fetch(API_PRODUCTOS);
      const data = await respuesta.json();

      if (!respuesta.ok) {
        setErrorProductos(data.error || "No se pudieron cargar los productos.");
        return;
      }

      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setErrorProductos("No se pudo conectar con el backend.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const toggleExpand = (productId) => {
    setProductoExpandido(productoExpandido === productId ? null : productId);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const abrirCarrito = () => {
    navigate("/carrito");
  };


  const agregarAlCarrito = async (producto) => {
  if (!user || !user.id) {
    alert("Debes iniciar sesión para agregar productos al carrito.");
    navigate("/login");
    return;
  }

  try {
    const respuesta = await fetch("http://localhost:3000/api/carrito", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuarioId: user.id,
        productoId: producto.id
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      alert(data.error || "No se pudo agregar el producto al carrito.");
      return;
    }

    alert(data.mensaje || "Producto agregado al carrito.");
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    alert("No se pudo conectar con el backend.");
  }
};

  const handleChangeProducto = (e) => {
    const { name, value } = e.target;

    setFormProducto({
      ...formProducto,
      [name]: value,
    });
  };

  const limpiarFormulario = () => {
    setFormProducto({
      nombre: "",
      descripcion: "",
      precio: "",
      stockDisponible: "",
      estado: "Disponible",
    });

    setProductoEditando(null);
  };

  const crearProducto = async () => {
    if (
      formProducto.nombre.trim() === "" ||
      formProducto.descripcion.trim() === "" ||
      formProducto.precio === "" ||
      formProducto.stockDisponible === ""
    ) {
      alert("Completa todos los campos del producto.");
      return;
    }

    try {
      const respuesta = await fetch(API_PRODUCTOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formProducto.nombre,
          descripcion: formProducto.descripcion,
          precio: Number(formProducto.precio),
          stockDisponible: Number(formProducto.stockDisponible),
          estado: formProducto.estado,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "No se pudo crear el producto.");
        return;
      }

      alert("Producto creado correctamente.");
      limpiarFormulario();
      cargarProductos();
    } catch (error) {
      console.error("Error al crear producto:", error);
      alert("No se pudo conectar con el backend.");
    }
  };

  const prepararEdicion = (producto) => {
    setProductoEditando(producto.id);

    setFormProducto({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stockDisponible: producto.stockDisponible,
      estado: producto.estado || "Disponible",
    });
  };

  const actualizarProducto = async () => {
    if (!productoEditando) {
      alert("Selecciona un producto para editar.");
      return;
    }

    try {
      const respuesta = await fetch(`${API_PRODUCTOS}/${productoEditando}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formProducto.nombre,
          descripcion: formProducto.descripcion,
          precio: Number(formProducto.precio),
          stockDisponible: Number(formProducto.stockDisponible),
          estado: formProducto.estado,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "No se pudo actualizar el producto.");
        return;
      }

      alert("Producto actualizado correctamente.");
      limpiarFormulario();
      cargarProductos();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      alert("No se pudo conectar con el backend.");
    }
  };

  const eliminarProducto = async (id) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este producto?");

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API_PRODUCTOS}/${id}`, {
        method: "DELETE",
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "No se pudo eliminar el producto.");
        return;
      }

      alert("Producto eliminado correctamente.");
      cargarProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("No se pudo conectar con el backend.");
    }
  };

  const cambiarEstado = (estado) => {
    setEstadoSeleccionado(estado);
    setPaginaActual(1);
  };

  const productosFiltrados =
    estadoSeleccionado === "Todos"
      ? productos
      : productos.filter((producto) => producto.estado === estadoSeleccionado);

  const productosPorPagina = 8;
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  const indiceUltimoProducto = paginaActual * productosPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;

  const productosPagina = productosFiltrados.slice(
    indicePrimerProducto,
    indiceUltimoProducto
  );

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      cambiarPagina(paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      cambiarPagina(paginaActual + 1);
    }
  };

  return (
    <div className="pagina-dashboard">
      <header className="barra-superior">
        <div>
          <h1>EcoMarket</h1>
          <p>Compra productos sostenibles de forma fácil y segura</p>
        </div>

        <button className="boton-carrito" onClick={abrirCarrito}>
          🛒 Carrito
        </button>
      </header>

      <main className="contenedor-usuario">
        <section className="contenido-tienda">
          <section className="seccion-bienvenida">
            <h2>
              Bienvenido
              {user?.nombre
                ? `, ${user.nombre}`
                : user?.user
                ? `, ${user.user}`
                : ""}
            </h2>
            <p>
              Explora nuestros productos ecológicos y agrega tus favoritos al
              carrito de compras.
            </p>
          </section>

          <section className="seccion-panel">
            <h2>
              Productos disponibles
              {estadoSeleccionado !== "Todos" && ` - ${estadoSeleccionado}`}
            </h2>

            {cargando && <p>Cargando productos...</p>}

            {errorProductos && (
              <p className="mensaje-sin-productos">{errorProductos}</p>
            )}

            {!cargando && !errorProductos && (
              <div className="lista-productos">
                {productosPagina.map((producto) => (
                  <div className="tarjeta-producto" key={producto.id}>
                    <div>
                      <h3>{producto.nombre}</h3>
                      <p className="categoria-producto">
                        {producto.estado || "Sin estado"}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleExpand(producto.id)}
                      className="boton-expandido"
                    >
                      {productoExpandido === producto.id ? "Ver menos" : "Ver más"}
                    </button>

                    {productoExpandido === producto.id && (
                      <div className="informacion-expandido">
                        <img
                          src={obtenerImagenProducto(producto.nombre)}
                          alt={producto.nombre}
                          className="imagen-expandida"
                        />

                        <p>
                          <strong>Descripción:</strong> {producto.descripcion}
                        </p>

                        <p>
                          <strong>Stock:</strong> {producto.stockDisponible}
                        </p>

                        <p>
                          <strong>Estado:</strong> {producto.estado}
                        </p>

                        <p>
                          <strong>Precio:</strong>{" "}
                          ${Number(producto.precio).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <button
                      className="boton-agregar"
                      onClick={() => agregarAlCarrito(producto)}
                    >
                      Agregar
                    </button>

                    <button
                      className="boton-expandido"
                      onClick={() => prepararEdicion(producto)}
                    >
                      Editar
                    </button>

                    <button
                      className="boton-cerrar-sesion"
                      onClick={() => eliminarProducto(producto.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!cargando && productosFiltrados.length === 0 && (
              <p className="mensaje-sin-productos">
                No hay productos disponibles.
              </p>
            )}

            {totalPaginas > 1 && (
              <div className="paginacion">
                <button
                  className="boton-paginacion"
                  onClick={paginaAnterior}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </button>

                {[...Array(totalPaginas)].map((_, index) => {
                  const numeroPagina = index + 1;

                  return (
                    <button
                      key={numeroPagina}
                      className={
                        paginaActual === numeroPagina
                          ? "numero-pagina activo"
                          : "numero-pagina"
                      }
                      onClick={() => cambiarPagina(numeroPagina)}
                    >
                      {numeroPagina}
                    </button>
                  );
                })}

                <button
                  className="boton-paginacion"
                  onClick={paginaSiguiente}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </button>
              </div>
            )}
          </section>
        </section>

        <aside className="panel-cuenta">
          <h2>Mi cuenta</h2>
          <p>Desde este apartado puedes gestionar tu sesión actual.</p>

          <div className="caja-sesion">
            <p>
              <strong>Usuario:</strong>{" "}
              {user?.nombre || user?.user || "Cliente"}
            </p>
            <p>
              <strong>Estado:</strong> Activo
            </p>
          </div>

          <button className="boton-cerrar-sesion" onClick={handleLogout}>
            Cerrar sesión
          </button>

          <div className="filtro-categorias">
            <h3>Filtrar por estado</h3>

            <div className="lista-categorias">
              {["Todos", "Disponible", "Agotado"].map((estado) => (
                <button
                  key={estado}
                  className={
                    estadoSeleccionado === estado
                      ? "boton-categoria activo"
                      : "boton-categoria"
                  }
                  onClick={() => cambiarEstado(estado)}
                >
                  {estado}
                </button>
              ))}
            </div>
          </div>

          <div className="filtro-categorias">
            <h3>{productoEditando ? "Editar producto" : "Crear producto"}</h3>

            <div className="lista-categorias">
              <input
              className="form-producto-input"
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formProducto.nombre}
              onChange={handleChangeProducto}
              />

              <input
              className="form-producto-input"
              type="text"
              name="descripcion"
              placeholder="Descripción"
              value={formProducto.descripcion}
              onChange={handleChangeProducto}
              />

              <input
              className="form-producto-input"
              type="number"
              name="precio"
              placeholder="Precio"
              value={formProducto.precio}
              onChange={handleChangeProducto}
              />

              <input
              className="form-producto-input"
              type="number"
              name="stockDisponible"
              placeholder="Stock"
              value={formProducto.stockDisponible}
              onChange={handleChangeProducto}
              />

            <select
            className="form-producto-select"
            name="estado"
            value={formProducto.estado}
            onChange={handleChangeProducto}
            >
              <option value="Disponible">Disponible</option>
            <option value="Agotado">Agotado</option>
            </select>

        {productoEditando ? (
          <>
            <button className="boton-crear-producto" onClick={actualizarProducto}>
              Actualizar producto
            </button>

            <button className="boton-cancelar-edicion" onClick={limpiarFormulario}>
              Cancelar
            </button>
          </>
        ) : (
          <button className="boton-crear-producto" onClick={crearProducto}>
            Crear producto
          </button>
        )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Dashboard;