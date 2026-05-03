import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";
import "../App.css";

import CepilloBambu from '../assets/ImagenesProductos/CepilloBambu.png'
import BotellaReutilizable from '../assets/ImagenesProductos/BotellaReutilizable.png'
import BolsaTela from '../assets/ImagenesProductos/BolsaTela.png'
import PitillosAcero from "../assets/ImagenesProductos/PitillosAcero.png"
import JabonArtesanal from "../assets/ImagenesProductos/JabonArtesanal.png"
import ShampooSolido from "../assets/ImagenesProductos/ShampooSolido.png"
import AcondicionadorSolido from "../assets/ImagenesProductos/AcondicionadorSolido.png"
import DesodoranteNatural from "../assets/ImagenesProductos/DesodoranteNatural.png"
import EsponjaVegetal from "../assets/ImagenesProductos/EsponjaVegetal.png"
import DetergenteEcologico from "../assets/ImagenesProductos/DetergenteEcologico.png"
import LimpiadorMultiusos from "../assets/ImagenesProductos/LimpiadorMultiusos.png"
import CepilloPlatosBambu from "../assets/ImagenesProductos/CepilloPlatosBambu.png"
import PañosReutilizables from "../assets/ImagenesProductos/PañosReutillizables.png"
import EnvoltorioCeraAbeja from "../assets/ImagenesProductos/EnvoltoriosCeraAbeja.png"
import ContenedorVidrio from "../assets/ImagenesProductos/ContenedorVidrio.png"
import MacetaBiodegradable from "../assets/ImagenesProductos/MacetaBiodegradable.png"
import SemillasHuerta from "../assets/ImagenesProductos/SemillasHuerta.png"
import ComposteraDomestica from "../assets/ImagenesProductos/ComposteraDomestica.png"
import CuadernoReciclado from "../assets/ImagenesProductos/CuadernoReciclado.png"
import LapicesReciclados from "../assets/ImagenesProductos/LapicesReciclados.png"

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [ productoExpandido, setProductoExpandido ] = useState(null);

    const toggleExpand = (productId) => {
        setProductoExpandido(productoExpandido === productId ? null: productId);
    }

    const productos = [
        {
            id: 1,
            nombre: "Cepillo de Bambú",
            precio: 6000,
            categoria: "Cuidado personal",
            descripcion: "Cepillo dental ecológico elaborado con bambú biodegradable.",
            stock: 190,
            imagen: CepilloBambu
        },
        {
            id: 2,
            nombre: "Botella Reutilizable",
            precio: 25000,
            categoria: "Hogar sostenible",
            descripcion: "Botella durable para reducir el consumo de plástico de un solo uso.",
            stock: 125,
            imagen: BotellaReutilizable
        },
        {
            id: 3,
            nombre: "Bolsa de Tela",
            precio: 12000,
            categoria: "Compras ecológicas",
            descripcion: "Bolsa reutilizable ideal para mercado, compras o uso diario.",
            stock: 2500,
            imagen: BolsaTela
        },
        {
            id: 4,
            nombre: "Pitillos de Acero",
            precio: 10000,
            categoria: "Cocina sostenible",
            descripcion: "Set de pitillos reutilizables en acero inoxidable.",
            stock: 348,
            imagen: PitillosAcero
        },
        {
            id: 5,
            nombre: "Jabón Artesanal",
            precio: 9000,
            categoria: "Cuidado personal",
            descripcion: "Jabón natural elaborado con ingredientes biodegradables.",
            stock: 12,
            imagen: JabonArtesanal
        },
        {
            id: 6,
            nombre: "Shampoo Sólido",
            precio: 18000,
            categoria: "Cuidado personal",
            descripcion: "Shampoo compacto sin envase plástico, práctico y ecológico.",
            stock: 3,
            imagen: ShampooSolido
        },
        {
            id: 7,
            nombre: "Acondicionador Sólido",
            precio: 19000,
            categoria: "Cuidado personal",
            descripcion: "Acondicionador en barra para reducir residuos plásticos.",
            stock: 1,
            imagen: AcondicionadorSolido
        },
        {
            id: 8,
            nombre: "Desodorante Natural",
            precio: 16000,
            categoria: "Cuidado personal",
            descripcion: "Desodorante libre de aluminio y elaborado con ingredientes naturales.",
            stock: 46,
            imagen: DesodoranteNatural
            
        },
        {
            id: 9,
            nombre: "Esponja Vegetal",
            precio: 8000,
            categoria: "Baño y aseo",
            descripcion: "Esponja biodegradable hecha a base de fibras vegetales.",
            stock: 400,
            imagen: EsponjaVegetal
        },
        {
            id: 10,
            nombre: "Detergente Ecológico",
            precio: 22000,
            categoria: "Limpieza del hogar",
            descripcion: "Detergente biodegradable para lavar ropa cuidando el medio ambiente.",
            stock: 34,
            imagen: DetergenteEcologico
        },
        {
            id: 11,
            nombre: "Limpiador Multiusos",
            precio: 15000,
            categoria: "Limpieza del hogar",
            descripcion: "Producto de limpieza biodegradable para diferentes superficies.",
            stock: 2,
            imagen: LimpiadorMultiusos
        },
        {
            id: 12,
            nombre: "Cepillo para Platos de Bambú",
            precio: 11000,
            categoria: "Cocina sostenible",
            descripcion: "Cepillo reutilizable con mango de bambú para lavar utensilios.",
            stock: 3,
            imagen: CepilloPlatosBambu
        },
        {
            id: 13,
            nombre: "Paños Reutilizables",
            precio: 14000,
            categoria: "Limpieza del hogar",
            descripcion: "Paños lavables que reemplazan servilletas o toallas desechables.",
            stock: 1000,
            imagen: PañosReutilizables
        },
        {
            id: 14,
            nombre: "Envoltorios de Cera de Abeja",
            precio: 20000,
            categoria: "Cocina sostenible",
            descripcion: "Envoltorios reutilizables para conservar alimentos sin plástico.",
            stock: 70,
            imagen: EnvoltorioCeraAbeja
        },
        {
            id: 15,
            nombre: "Contenedor de Vidrio",
            precio: 24000,
            categoria: "Cocina sostenible",
            descripcion: "Recipiente reutilizable para almacenar alimentos de forma segura.",
            stock: 5,
            imagen: ContenedorVidrio
        },
        {
            id: 16,
            nombre: "Maceta Biodegradable",
            precio: 7000,
            categoria: "Jardinería",
            descripcion: "Maceta compostable ideal para plantas pequeñas o semilleros.",
            stock: 10,
            imagen: MacetaBiodegradable
        },
        {
            id: 17,
            nombre: "Semillas para Huerta",
            precio: 5000,
            categoria: "Jardinería",
            descripcion: "Paquete de semillas para iniciar una huerta casera sostenible.",
            stock: 50,
            imagen: SemillasHuerta
        },
        {
            id: 18,
            nombre: "Compostera Doméstica",
            precio: 85000,
            categoria: "Hogar sostenible",
            descripcion: "Compostera para transformar residuos orgánicos en abono natural.",
            stock: 20,
            imagen: ComposteraDomestica
        },
        {
            id: 19,
            nombre: "Cuaderno Reciclado",
            precio: 13000,
            categoria: "Papelería ecológica",
            descripcion: "Cuaderno elaborado con papel reciclado y materiales sostenibles.",
            stock: 150,
            imagen: CuadernoReciclado
        },
        {
            id: 20,
            nombre: "Lápices Reciclados",
            precio: 6000,
            categoria: "Papelería ecológica",
            descripcion: "Set de lápices fabricados con materiales reciclados.",
            stock: 200,
            imagen: LapicesReciclados
        },
    ];

    const [paginaActual, setPaginaActual] = useState(1);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

    const categorias = [
        "Todas",
        ...new Set(productos.map((producto) => producto.categoria)),
    ];

    const productosFiltrados =
    categoriaSeleccionada === "Todas"
    ? productos
    : productos.filter((producto) => producto.categoria === categoriaSeleccionada);

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

    const cambiarCategoria = (categoria) => {
        setCategoriaSeleccionada(categoria);
        setPaginaActual(1);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const abrirCarrito = () => {
        navigate("/carrito");
    };

    const agregarAlCarrito = (producto) => {
        const carritoGuardado = localStorage.getItem("carritoEcoMarket");
        const carritoActual = carritoGuardado ? JSON.parse(carritoGuardado) : [];

        const productoExistente = carritoActual.find(
            (item) => item.id === producto.id
        );

        let nuevoCarrito;

    if (productoExistente) {
        nuevoCarrito = carritoActual.map((item) =>
            item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
    } else {
        nuevoCarrito = [
            ...carritoActual,
            {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                categoria: producto.categoria,
                cantidad: 1,
            },
        ];
    }

    localStorage.setItem("carritoEcoMarket", JSON.stringify(nuevoCarrito));
    alert(`${producto.nombre} agregado al carrito`);
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
                        <h2>Bienvenido{user?.user ? `, ${user.user}` : ""}</h2>
                        <p>Explora nuestros productos ecológicos y agrega tus favoritos al carrito de compras.</p>
                    </section>

                    <section className="seccion-panel">
                        <h2>Productos disponibles {categoriaSeleccionada !== "Todas" && ` - ${categoriaSeleccionada}`}</h2>             

                        <div className="lista-productos">
                            {productosPagina.map((producto) => (
                                <div className="tarjeta-producto" key={producto.id}>
                                    <div>
                                        <h3>{producto.nombre}</h3>
                                        <p className="categoria-producto">{producto.categoria}</p>

                                    </div>

                                    <button onClick={() => toggleExpand(producto.id)}
                                    className="boton-expandido">
                                        {productoExpandido === producto.id ? "Ver menos" : "Ver más"}
                                    </button>

                                    {productoExpandido === producto.id && (
                                        <div classname="informacion-expandido">
                                            <img src={producto.imagen} alt={producto.nombre} className="imagen-expandida" />
                                            <p><strong>Descripción:</strong> {producto.descripcion} </p>
                                            <p><strong>Stock:</strong> {producto.stock} </p>
                                            <p><strong>Categoría:</strong> {producto.categoria} </p>
                                            <p><strong>Precio:</strong> {producto.precio} </p>
                                        </div>
                                    )}

                                    <button className="boton-agregar" onClick={() => agregarAlCarrito(producto)}>
                                        Agregar
                                    </button>
                                </div>
                            ))}
                        </div>

                        {productosFiltrados.length === 0 && (
                            <p className="mensaje-sin-productos">
                            No hay productos disponibles en esta categoría.
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
                    <p>
                        Desde este apartado puedes gestionar tu sesión actual de manera segura.
                    </p>

                    <div className="caja-sesion">
                        <p>
                            <strong>Usuario:</strong> {user?.user || "Cliente"}
                        </p>
                        <p>
                            <strong>Estado:</strong> Activo
                        </p>
                    </div>

                    <button className="boton-cerrar-sesion" onClick={handleLogout}>
                        Cerrar sesión
                    </button>

                    <div className="filtro-categorias">
                        <h3>Filtrar por categoría</h3>

                        <div className="lista-categorias">
                            {categorias.map((categoria) => (
                                <button
                                    key={categoria}
                                    className={
                                    categoriaSeleccionada === categoria
                                    ? "boton-categoria activo"
                                    : "boton-categoria"
                                }
                                onClick={() => cambiarCategoria(categoria)}
                                >
                                    {categoria}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default Dashboard;