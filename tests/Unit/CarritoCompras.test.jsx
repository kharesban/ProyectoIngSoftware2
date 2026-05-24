import React from "react";
import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CarritoCompras from "../../src/Paginas/CarritoCompras";
import { AuthContext } from "../../src/Context/MyContext";

const usuarioMock = {
  id: 1,
  nombre: "Usuario Test",
};

const carritoMock = {
  id: 1,
  usuarioId: 1,
  total: 24000,
  ItemCarritos: [
    {
      id: 10,
      carritoId: 1,
      productoId: 1,
      cantidad: 2,
      precioUnitario: 12000,
      total: 24000,
      Producto: {
        nombre: "Cepillo de bambú",
      },
    },
  ],
};

const carritoVacioMock = {
  id: 1,
  usuarioId: 1,
  total: 0,
  ItemCarritos: [],
};

const renderCarrito = (user = usuarioMock) => {
  return render(
    <AuthContext.Provider value={{ user }}>
      <MemoryRouter initialEntries={["/carrito"]}>
        <Routes>
          <Route path="/carrito" element={<CarritoCompras />} />
          <Route path="/login" element={<h1>Login</h1>} />
          <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          <Route path="/pasarela-pagos" element={<h1>Pasarela de pagos</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("CarritoCompras.jsx", () => {
  beforeEach(() => {
    global.fetch = jest.fn();

    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "confirm").mockImplementation(() => true);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("redirige al login si no hay usuario autenticado", async () => {
    renderCarrito(null);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Debes iniciar sesión para ver tu carrito."
      );
    });

    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("carga y muestra productos del carrito", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => carritoMock,
    });

    renderCarrito();

    expect(screen.getByText("Cargando carrito...")).toBeInTheDocument();

    expect(await screen.findByText("Cepillo de bambú")).toBeInTheDocument();
    expect(screen.getByText(/Total de productos: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Total a pagar/i)).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/carrito/1"
    );
  });

  test("muestra mensaje cuando el carrito está vacío", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => carritoVacioMock,
    });

    renderCarrito();

    expect(await screen.findByText("Tu carrito está vacío.")).toBeInTheDocument();
  });

  test("aumenta la cantidad de un producto", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => carritoMock,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          mensaje: "Cantidad actualizada",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...carritoMock,
          total: 36000,
          ItemCarritos: [
            {
              ...carritoMock.ItemCarritos[0],
              cantidad: 3,
              total: 36000,
            },
          ],
        }),
      });

    renderCarrito();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: "+" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/carrito/item/10",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            cantidad: 3,
          }),
        })
      );
    });
  });

  test("elimina un producto del carrito", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => carritoMock,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          mensaje: "Producto eliminado",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => carritoVacioMock,
      });

    renderCarrito();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/carrito/item/10",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  test("vacía el carrito cuando el usuario confirma", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => carritoMock,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          mensaje: "Carrito vaciado",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => carritoVacioMock,
      });

    renderCarrito();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: /vaciar carrito/i }));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/carrito/usuario/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  test("navega a la pasarela de pagos si el carrito tiene productos", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => carritoMock,
    });

    renderCarrito();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: /proceder al pago/i }));

    expect(screen.getByText("Pasarela de pagos")).toBeInTheDocument();
  });
  test("muestra alerta si falla la carga del carrito por respuesta no exitosa", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({
      error: "No se pudo cargar el carrito",
    }),
  });

  renderCarrito();

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalled();
  });
});

    test("muestra alerta si ocurre error de conexión al cargar el carrito", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Error de conexión"));

    renderCarrito();

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });

    expect(console.error).toHaveBeenCalled();
    });

    test("disminuye la cantidad de un producto cuando la cantidad es mayor a 1", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => carritoMock,
        })
        .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            mensaje: "Cantidad actualizada",
        }),
        })
        .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            ...carritoMock,
            total: 12000,
            ItemCarritos: [
            {
                ...carritoMock.ItemCarritos[0],
                cantidad: 1,
                total: 12000,
            },
            ],
        }),
        });

    renderCarrito();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: "-" }));

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/carrito/item/10",
        expect.objectContaining({
            method: "PUT",
            body: JSON.stringify({
            cantidad: 1,
            }),
        })
        );
    });
    });

    test("muestra alerta si falla la actualización de cantidad", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => carritoMock,
        })
        .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
            error: "No se pudo actualizar la cantidad",
        }),
        });

    renderCarrito();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: "+" }));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });
    });
    test("muestra alerta si falla la eliminación de un producto", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => carritoMock,
        })
        .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
            error: "No se pudo eliminar el producto",
        }),
        });

    renderCarrito();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });
    });

    test("no vacía el carrito si el usuario cancela la confirmación", async () => {
    window.confirm.mockReturnValueOnce(false);

    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => carritoMock,
    });

    renderCarrito();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: /vaciar carrito/i }));

    expect(window.confirm).toHaveBeenCalled();

    expect(global.fetch).not.toHaveBeenCalledWith(
        "http://localhost:3000/api/carrito/usuario/1",
        expect.objectContaining({
        method: "DELETE",
        })
    );
    });

    test("muestra alerta si falla al vaciar el carrito", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => carritoMock,
        })
        .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
            error: "No se pudo vaciar el carrito",
        }),
        });

    renderCarrito();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: /vaciar carrito/i }));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });
    });

    test("muestra alerta si intenta proceder al pago con carrito vacío", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => carritoVacioMock,
    });

    renderCarrito();

    await screen.findByText("Tu carrito está vacío.");

    await userEvent.click(screen.getByRole("button", { name: /proceder al pago/i }));

    expect(window.alert).toHaveBeenCalled();
    });
});