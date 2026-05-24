import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";
import "../App.css";

const PasarelaPagos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const datosPago = location.state;

  const [metodoPago, setMetodoPago] = useState("");
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState("");
  const [procesando, setProcesando] = useState(false);

  const [datosCliente, setDatosCliente] = useState({
    nombre: user?.user || "",
    documento: "",
    telefono: "",
    correo: ""
  });

  const [datosContraEntrega, setDatosContraEntrega] = useState({
    puntoPago: ""
  });

  const [datosTarjeta, setDatosTarjeta] = useState({
    nombreTitular: "",
    numeroTarjeta: "",
    fechaVencimiento: "",
    cvv: "",
    cuotas: ""
  });

  useEffect(() => {
    if (!datosPago) {
      alert("Primero debes tener productos en el carrito.");
      navigate("/carrito");
    }
  }, [datosPago, navigate]);

  if (!datosPago) {
    return null;
  }

  const productos = datosPago.productos || [];
  const totalProductos = datosPago.totalProductos || 0;
  const totalPagar = Number(datosPago.totalPagar || 0);
  const usuarioId = datosPago.usuarioId;

    const validarLuhn = (numeroTarjeta) => {
    const numeroLimpio = numeroTarjeta.replace(/\D/g, "");

    if (numeroLimpio.length < 13 || numeroLimpio.length > 19) {
      return false;
    }

    let suma = 0;
    let duplicar = false;

    for (let i = numeroLimpio.length - 1; i >= 0; i--) {
      let digito = parseInt(numeroLimpio[i], 10);

      if (duplicar) {
        digito = digito * 2;

        if (digito > 9) {
          digito = digito - 9;
        }
      }

      suma = suma + digito;
      duplicar = !duplicar;
    }

    return suma % 10 === 0;
  };

  const validarFechaVencimiento = (fecha) => {
    const formatoValido = /^(0[1-9]|1[0-2])\/\d{2}$/.test(fecha);

    if (!formatoValido) {
      return false;
    }

    const partesFecha = fecha.split("/");
    const mes = parseInt(partesFecha[0], 10);
    const anio = parseInt(`20${partesFecha[1]}`, 10);

    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear();

    if (anio < anioActual) {
      return false;
    }

    if (anio === anioActual && mes < mesActual) {
      return false;
    }

    return true;
  };

  const esPagoConTarjeta = () => {
    return metodoPago === "credito" || metodoPago === "debito";
  };

  const validarNombreCliente = () => {
    if (!datosCliente.nombre.trim()) {
      return "El nombre es obligatorio.";
    }

    return "";
  };

  const validarDocumentoCliente = () => {
    if (!datosCliente.documento.trim()) {
      return "El documento es obligatorio.";
    }

    if (!/^\d{6,12}$/.test(datosCliente.documento)) {
      return "El documento debe tener entre 6 y 12 números.";
    }

    return "";
  };

  const validarTelefonoCliente = () => {
    if (!datosCliente.telefono.trim()) {
      return "El teléfono es obligatorio.";
    }

    if (!/^\d{10}$/.test(datosCliente.telefono)) {
      return "El teléfono debe tener exactamente 10 números.";
    }

    return "";
  };

  const tieneEspacios = (texto) => {
  return texto.includes(" ");
};

const validarFormatoCorreo = (correo) => {
  const partesCorreo = correo.split("@");

  if (partesCorreo.length !== 2) {
    return false;
  }

  const [usuarioCorreo, dominioCorreo] = partesCorreo;

  if (!usuarioCorreo || !dominioCorreo) {
    return false;
  }

  if (tieneEspacios(usuarioCorreo) || tieneEspacios(dominioCorreo)) {
    return false;
  }

  const partesDominio = dominioCorreo.split(".");

  if (partesDominio.length < 2) {
    return false;
  }

  return partesDominio.every((parte) => parte.length > 0);
};

const validarCorreoCliente = () => {
  const correo = datosCliente.correo.trim();

  if (!correo) {
    return "El correo es obligatorio.";
  }

  if (!validarFormatoCorreo(correo)) {
    return "El correo no tiene un formato válido.";
  }

  return "";
};

  const validarDatosCliente = () => {
    const erroresCliente = {};

    const errorNombre = validarNombreCliente();
    const errorDocumento = validarDocumentoCliente();
    const errorTelefono = validarTelefonoCliente();
    const errorCorreo = validarCorreoCliente();

    if (errorNombre) erroresCliente.nombre = errorNombre;
    if (errorDocumento) erroresCliente.documento = errorDocumento;
    if (errorTelefono) erroresCliente.telefono = errorTelefono;
    if (errorCorreo) erroresCliente.correo = errorCorreo;

    return erroresCliente;
  };

  const validarMetodoPago = () => {
    const erroresMetodo = {};

    if (!metodoPago) {
      erroresMetodo.metodoPago = "Debes seleccionar un método de pago.";
    }

    if (metodoPago === "contraEntrega" && !datosContraEntrega.puntoPago) {
      erroresMetodo.puntoPago = "Debes seleccionar Efecty o Servientrega.";
    }

    return erroresMetodo;
  };

  const validarNombreTitular = () => {
    if (!datosTarjeta.nombreTitular.trim()) {
      return "El nombre del titular es obligatorio.";
    }

    return "";
  };

  const validarNumeroTarjetaCampo = () => {
    if (!datosTarjeta.numeroTarjeta.trim()) {
      return "El número de tarjeta es obligatorio.";
    }

    if (!validarLuhn(datosTarjeta.numeroTarjeta)) {
      return "El número de tarjeta no es válido.";
    }

    return "";
  };

  const validarFechaTarjetaCampo = () => {
    if (!datosTarjeta.fechaVencimiento.trim()) {
      return "La fecha de vencimiento es obligatoria.";
    }

    if (!validarFechaVencimiento(datosTarjeta.fechaVencimiento)) {
      return "La fecha debe tener formato MM/AA y no estar vencida.";
    }

    return "";
  };

  const validarCvvTarjeta = () => {
    if (!datosTarjeta.cvv.trim()) {
      return "El CVV es obligatorio.";
    }

    if (!/^\d{3,4}$/.test(datosTarjeta.cvv)) {
      return "El CVV debe tener 3 o 4 números.";
    }

    return "";
  };

  const validarDatosTarjeta = () => {
    const erroresTarjeta = {};

    if (!esPagoConTarjeta()) {
      return erroresTarjeta;
    }

    const errorNombreTitular = validarNombreTitular();
    const errorNumeroTarjeta = validarNumeroTarjetaCampo();
    const errorFecha = validarFechaTarjetaCampo();
    const errorCvv = validarCvvTarjeta();

    if (errorNombreTitular) erroresTarjeta.nombreTitular = errorNombreTitular;
    if (errorNumeroTarjeta) erroresTarjeta.numeroTarjeta = errorNumeroTarjeta;
    if (errorFecha) erroresTarjeta.fechaVencimiento = errorFecha;
    if (errorCvv) erroresTarjeta.cvv = errorCvv;

    return erroresTarjeta;
  };

  const validarCuotas = () => {
    if (metodoPago === "credito" && !datosTarjeta.cuotas) {
      return {
        cuotas: "Debes seleccionar el número de cuotas.",
      };
    }

    return {};
  };

  const validarCampos = () => {
    const nuevosErrores = {
      ...validarDatosCliente(),
      ...validarMetodoPago(),
      ...validarDatosTarjeta(),
      ...validarCuotas(),
    };

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarCambioCliente = (evento) => {
    const { name, value } = evento.target;

    setDatosCliente({
      ...datosCliente,
      [name]: value
    });
  };

  const manejarCambioTarjeta = (evento) => {
    const { name, value } = evento.target;

    setDatosTarjeta({
      ...datosTarjeta,
      [name]: value
    });
  };

  const manejarCambioMetodoPago = (evento) => {
    setMetodoPago(evento.target.value);
    setErrores({});
    setMensajeExito("");
  };

  const limpiarCarritoDespuesDelPago = async () => {
    try {
      await fetch(`http://localhost:3000/api/carrito/usuario/${usuarioId}`, {
        method: "DELETE"
      });
    } catch (error) {
      console.error("No se pudo limpiar el carrito después del pago:", error);
    }
  };

  const confirmarPago = async (evento) => {
    evento.preventDefault();
    setMensajeExito("");

    const formularioValido = validarCampos();

    if (!formularioValido) {
      return;
    }

    setProcesando(true);

    try {
      const datosParaBackend = {
        usuarioId: usuarioId,
        metodoPago: metodoPago,
        nombreTitular:
          metodoPago === "contraEntrega"
            ? datosCliente.nombre
            : datosTarjeta.nombreTitular,
        numeroTarjeta:
          metodoPago === "contraEntrega"
            ? null
            : datosTarjeta.numeroTarjeta,
        fechaExpiracion:
          metodoPago === "contraEntrega"
            ? null
            : datosTarjeta.fechaVencimiento,
        cvv:
          metodoPago === "contraEntrega"
            ? null
            : datosTarjeta.cvv
      };

      const respuesta = await fetch("http://localhost:3000/api/pagos/procesar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosParaBackend)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "No se pudo procesar el pago.");
        setProcesando(false);
        return;
      }

      setMensajeExito(data.mensaje || "Pago registrado correctamente. Tu pedido fue procesado.");
      setProcesando(false);

    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("No se pudo conectar con el backend.");
      setProcesando(false);
    }
  };

  const volverAlCarrito = () => {
    navigate("/carrito");
  };

  const volverDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="pagina-dashboard">
      <header className="barra-superior">
        <div>
          <h1>EcoMarket</h1>
          <p>Pasarela de pagos segura para finalizar tu compra</p>
        </div>

        <button className="boton-carrito" onClick={volverAlCarrito}>
          Volver al carrito
        </button>
      </header>

      <main className="contenedor-usuario">
        <section className="contenido-tienda">
          <section className="seccion-panel">
            <h2>Datos de pago</h2>

            <form className="formulario-pasarela" onSubmit={confirmarPago}>
              <div className="grupo-formulario-pago">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={datosCliente.nombre}
                  onChange={manejarCambioCliente}
                  placeholder="Ej: Manuel Betancurt"
                />
                {errores.nombre && <small>{errores.nombre}</small>}
              </div>

              <div className="grupo-formulario-pago">
                <label>Documento</label>
                <input
                  type="text"
                  name="documento"
                  value={datosCliente.documento}
                  onChange={manejarCambioCliente}
                  placeholder="Ej: 1000000000"
                />
                {errores.documento && <small>{errores.documento}</small>}
              </div>

              <div className="grupo-formulario-pago">
                <label>Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={datosCliente.telefono}
                  onChange={manejarCambioCliente}
                  placeholder="Ej: 3001234567"
                />
                {errores.telefono && <small>{errores.telefono}</small>}
              </div>

              <div className="grupo-formulario-pago">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={datosCliente.correo}
                  onChange={manejarCambioCliente}
                  placeholder="Ej: correo@gmail.com"
                />
                {errores.correo && <small>{errores.correo}</small>}
              </div>

              <h3 className="titulo-metodo-pago">Selecciona el método de pago</h3>

              <div className="opciones-pago">
                <label className="tarjeta-metodo-pago">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="contraEntrega"
                    checked={metodoPago === "contraEntrega"}
                    onChange={manejarCambioMetodoPago}
                  />
                  <div>
                    <strong>Pago contra entrega</strong>
                    <p>Pago en punto local: Efecty o Servientrega.</p>
                  </div>
                </label>

                <label className="tarjeta-metodo-pago">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="credito"
                    checked={metodoPago === "credito"}
                    onChange={manejarCambioMetodoPago}
                  />
                  <div>
                    <strong>Tarjeta de crédito</strong>
                    <p>Permite diferir el pago a cuotas.</p>
                  </div>
                </label>

                <label className="tarjeta-metodo-pago">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="debito"
                    checked={metodoPago === "debito"}
                    onChange={manejarCambioMetodoPago}
                  />
                  <div>
                    <strong>Tarjeta débito</strong>
                    <p>Pago directo desde tu cuenta bancaria.</p>
                  </div>
                </label>
              </div>

              {errores.metodoPago && (
                <p className="error-general-pago">{errores.metodoPago}</p>
              )}

              {metodoPago === "contraEntrega" && (
                <div className="caja-metodo-seleccionado">
                  <h3>Pago en punto local</h3>

                  <div className="grupo-formulario-pago">
                    <label>Punto de pago</label>
                    <select
                      value={datosContraEntrega.puntoPago}
                      onChange={(evento) =>
                        setDatosContraEntrega({
                          ...datosContraEntrega,
                          puntoPago: evento.target.value
                        })
                      }
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Efecty">Efecty</option>
                      <option value="Servientrega">Servientrega</option>
                    </select>
                    {errores.puntoPago && <small>{errores.puntoPago}</small>}
                  </div>

                  <p className="texto-ayuda-pago">
                    Al confirmar, se generará la orden para que puedas pagar en el punto seleccionado.
                  </p>
                </div>
              )}

              {(metodoPago === "credito" || metodoPago === "debito") && (
                <div className="caja-metodo-seleccionado">
                  <h3>
                    {metodoPago === "credito"
                      ? "Pago con tarjeta de crédito"
                      : "Pago con tarjeta débito"}
                  </h3>

                  <div className="grupo-formulario-pago">
                    <label>Nombre del titular</label>
                    <input
                      type="text"
                      name="nombreTitular"
                      value={datosTarjeta.nombreTitular}
                      onChange={manejarCambioTarjeta}
                      placeholder="Como aparece en la tarjeta"
                    />
                    {errores.nombreTitular && <small>{errores.nombreTitular}</small>}
                  </div>

                  <div className="grupo-formulario-pago">
                    <label>Número de tarjeta</label>
                    <input
                      type="text"
                      name="numeroTarjeta"
                      value={datosTarjeta.numeroTarjeta}
                      onChange={manejarCambioTarjeta}
                      placeholder="Ej: 4111111111111111"
                      maxLength="19"
                    />
                    {errores.numeroTarjeta && <small>{errores.numeroTarjeta}</small>}
                  </div>

                  <div className="fila-pago">
                    <div className="grupo-formulario-pago">
                      <label>Fecha de vencimiento</label>
                      <input
                        type="text"
                        name="fechaVencimiento"
                        value={datosTarjeta.fechaVencimiento}
                        onChange={manejarCambioTarjeta}
                        placeholder="MM/AA"
                        maxLength="5"
                      />
                      {errores.fechaVencimiento && <small>{errores.fechaVencimiento}</small>}
                    </div>

                    <div className="grupo-formulario-pago">
                      <label>CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        value={datosTarjeta.cvv}
                        onChange={manejarCambioTarjeta}
                        placeholder="123"
                        maxLength="4"
                      />
                      {errores.cvv && <small>{errores.cvv}</small>}
                    </div>
                  </div>

                  {metodoPago === "credito" && (
                    <div className="grupo-formulario-pago">
                      <label>Número de cuotas</label>
                      <select
                        name="cuotas"
                        value={datosTarjeta.cuotas}
                        onChange={manejarCambioTarjeta}
                      >
                        <option value="">Selecciona las cuotas</option>
                        <option value="1">1 cuota</option>
                        <option value="3">3 cuotas</option>
                        <option value="6">6 cuotas</option>
                        <option value="12">12 cuotas</option>
                        <option value="24">24 cuotas</option>
                      </select>
                      {errores.cuotas && <small>{errores.cuotas}</small>}
                    </div>
                  )}

                  <p className="texto-ayuda-pago">
                    Para pruebas puedes usar la tarjeta 4111111111111111. Esta validación es simulada.
                  </p>
                </div>
              )}

              {mensajeExito && (
                <div className="mensaje-pago-exitoso">
                  {mensajeExito}
                </div>
              )}

              <button
                className="boton-confirmar-pago"
                type="submit"
                disabled={procesando}
              >
                {procesando ? "Procesando pago..." : "Confirmar pago"}
              </button>

              {mensajeExito && (
                <button
                  type="button"
                  className="boton-volver-tienda"
                  onClick={volverDashboard}
                >
                  Volver a la tienda
                </button>
              )}
            </form>
          </section>
        </section>

        <aside className="panel-cuenta">
          <h2>Resumen del pedido</h2>

          <p>Total de productos: {totalProductos}</p>

          <h3>
            Total a pagar: ${totalPagar.toLocaleString("es-CO")}
          </h3>

          <div className="resumen-productos-pago">
            {productos.map((item) => (
              <div className="item-resumen-pago" key={item.id}>
                <span>{item.Producto?.nombre}</span>
                <small>
                  {item.cantidad} x ${Number(item.precioUnitario).toLocaleString("es-CO")}
                </small>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default PasarelaPagos;