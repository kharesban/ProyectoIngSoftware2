import React from "react";
import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PasarelaPagos from "../../src/Paginas/PasarelaPagos";
import { AuthContext } from "../../src/Context/MyContext";

const datosPagoMock = {
  carritoId: 1,
  usuarioId: 1,
  totalProductos: 2,
  totalPagar: 24000,
  productos: [
    {
      id: 1,
      cantidad: 2,
      precioUnitario: 12000,
      Producto: {
        nombre: "Cepillo de bambú",
      },
    },
  ],
};

const renderPasarela = ({ datosPago = datosPagoMock, usuario = { id: 1, user: "Usuario Test" } } = {}) => {
  return render(
    <AuthContext.Provider value={{ user: usuario }}>
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/pasarela-pagos",
            state: datosPago,
          },
        ]}
      >
        <Routes>
          <Route path="/pasarela-pagos" element={<PasarelaPagos />} />
          <Route path="/carrito" element={<h1>Carrito</h1>} />
          <Route path="/dashboard" element={<h1>Dashboard</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

const llenarInput = async (container, name, value) => {
  const input = container.querySelector(`input[name="${name}"]`);

  expect(input).toBeInTheDocument();

  await userEvent.clear(input);
  await userEvent.type(input, value);
};

const llenarDatosCliente = async (container) => {
  await llenarInput(container, "nombre", "Usuario Test");
  await llenarInput(container, "documento", "1234567890");
  await llenarInput(container, "telefono", "3001234567");
  await llenarInput(container, "correo", "usuario@test.com");
};

const llenarDatosTarjetaValida = async (container) => {
  await llenarInput(container, "nombreTitular", "Usuario Test");
  await llenarInput(container, "numeroTarjeta", "4111111111111111");
  await llenarInput(container, "fechaVencimiento", "12/29");
  await llenarInput(container, "cvv", "123");
};

describe("PasarelaPagos.jsx", () => {
  beforeEach(() => {
    global.fetch = jest.fn();

    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renderiza datos de pago y resumen del pedido", () => {
    renderPasarela();

    expect(screen.getByText("Datos de pago")).toBeInTheDocument();
    expect(screen.getByText("Resumen del pedido")).toBeInTheDocument();
    expect(screen.getByText("Total de productos: 2")).toBeInTheDocument();
    expect(screen.getByText("Cepillo de bambú")).toBeInTheDocument();
    expect(screen.getByText(/Total a pagar/i)).toBeInTheDocument();
  });

  test("redirige al carrito si no existen datos de pago", async () => {
    renderPasarela({ datosPago: null });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Primero debes tener productos en el carrito."
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Carrito")).toBeInTheDocument();
    });
  });

  test("muestra errores si se confirma sin datos obligatorios", async () => {
    renderPasarela();

    await userEvent.click(screen.getByRole("button", { name: /confirmar pago/i }));

    expect(screen.getByText("El documento es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El teléfono es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El correo es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("Debes seleccionar un método de pago.")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("muestra campos de tarjeta cuando se selecciona crédito", async () => {
    const { container } = renderPasarela();

    await userEvent.click(container.querySelector('input[name="metodoPago"][value="credito"]'));

    expect(screen.getByText("Pago con tarjeta de crédito")).toBeInTheDocument();
    expect(container.querySelector('input[name="nombreTitular"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="numeroTarjeta"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="fechaVencimiento"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="cvv"]')).toBeInTheDocument();
    expect(container.querySelector('select[name="cuotas"]')).toBeInTheDocument();
  });

  test("rechaza tarjeta de crédito con número inválido por Luhn", async () => {
    const { container } = renderPasarela();

    await llenarDatosCliente(container);

    await userEvent.click(container.querySelector('input[name="metodoPago"][value="credito"]'));

    await llenarInput(container, "nombreTitular", "Usuario Test");
    await llenarInput(container, "numeroTarjeta", "1234567890123456");
    await llenarInput(container, "fechaVencimiento", "12/29");
    await llenarInput(container, "cvv", "123");

    await userEvent.selectOptions(container.querySelector('select[name="cuotas"]'), "1");

    await userEvent.click(screen.getByRole("button", { name: /confirmar pago/i }));

    expect(screen.getByText("El número de tarjeta no es válido.")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("rechaza tarjeta de crédito sin cuotas", async () => {
    const { container } = renderPasarela();

    await llenarDatosCliente(container);

    await userEvent.click(container.querySelector('input[name="metodoPago"][value="credito"]'));

    await llenarDatosTarjetaValida(container);

    await userEvent.click(screen.getByRole("button", { name: /confirmar pago/i }));

    expect(screen.getByText("Debes seleccionar el número de cuotas.")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("procesa pago con tarjeta de crédito válida", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        mensaje: "Pago registrado correctamente. Tu pedido fue procesado.",
      }),
    });

    const { container } = renderPasarela();

    await llenarDatosCliente(container);

    await userEvent.click(container.querySelector('input[name="metodoPago"][value="credito"]'));

    await llenarDatosTarjetaValida(container);

    await userEvent.selectOptions(container.querySelector('select[name="cuotas"]'), "1");

    await userEvent.click(screen.getByRole("button", { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/pagos/procesar",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });

    const bodyEnviado = JSON.parse(global.fetch.mock.calls[0][1].body);

    expect(bodyEnviado).toEqual({
      usuarioId: 1,
      metodoPago: "credito",
      nombreTitular: "Usuario Test",
      numeroTarjeta: "4111111111111111",
      fechaExpiracion: "12/29",
      cvv: "123",
    });

    expect(
      await screen.findByText("Pago registrado correctamente. Tu pedido fue procesado.")
    ).toBeInTheDocument();
  });

  test("procesa pago con tarjeta débito válida sin cuotas", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        mensaje: "Pago registrado correctamente. Tu pedido fue procesado.",
      }),
    });

    const { container } = renderPasarela();

    await llenarDatosCliente(container);

    await userEvent.click(container.querySelector('input[name="metodoPago"][value="debito"]'));

    expect(screen.getByText("Pago con tarjeta débito")).toBeInTheDocument();

    await llenarDatosTarjetaValida(container);

    await userEvent.click(screen.getByRole("button", { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const bodyEnviado = JSON.parse(global.fetch.mock.calls[0][1].body);

    expect(bodyEnviado.metodoPago).toBe("debito");
    expect(bodyEnviado.nombreTitular).toBe("Usuario Test");
    expect(bodyEnviado.numeroTarjeta).toBe("4111111111111111");
    expect(bodyEnviado.fechaExpiracion).toBe("12/29");
    expect(bodyEnviado.cvv).toBe("123");
  });

  test("procesa pago contra entrega con punto de pago", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        mensaje: "Pago registrado correctamente. Tu pedido fue procesado.",
      }),
    });

    const { container } = renderPasarela();

    await llenarDatosCliente(container);

    await userEvent.click(container.querySelector('input[name="metodoPago"][value="contraEntrega"]'));

    expect(screen.getByText("Pago en punto local")).toBeInTheDocument();

    const selectPuntoPago = container.querySelector(".caja-metodo-seleccionado select");

    await userEvent.selectOptions(selectPuntoPago, "Efecty");

    await userEvent.click(screen.getByRole("button", { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const bodyEnviado = JSON.parse(global.fetch.mock.calls[0][1].body);

    expect(bodyEnviado).toEqual({
      usuarioId: 1,
      metodoPago: "contraEntrega",
      nombreTitular: "Usuario Test",
      numeroTarjeta: null,
      fechaExpiracion: null,
      cvv: null,
    });
  });

  test("muestra alerta cuando el backend rechaza el pago", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "No se pudo procesar el pago.",
      }),
    });

    const { container } = renderPasarela();

    await llenarDatosCliente(container);

    await userEvent.click(container.querySelector('input[name="metodoPago"][value="credito"]'));

    await llenarDatosTarjetaValida(container);

    await userEvent.selectOptions(container.querySelector('select[name="cuotas"]'), "1");

    await userEvent.click(screen.getByRole("button", { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("No se pudo procesar el pago.");
    });
  });

  test("muestra alerta cuando falla la conexión con el backend", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Error de conexión"));

    const { container } = renderPasarela();

    await llenarDatosCliente(container);

    await userEvent.click(container.querySelector('input[name="metodoPago"][value="credito"]'));

    await llenarDatosTarjetaValida(container);

    await userEvent.selectOptions(container.querySelector('select[name="cuotas"]'), "1");

    await userEvent.click(screen.getByRole("button", { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("No se pudo conectar con el backend.");
    });
  });
});