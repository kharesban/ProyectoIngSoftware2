import React from "react";
import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../../src/Paginas/dashboard";
import { AuthContext } from "../../src/Context/MyContext";

const usuarioMock = {
  id: 1,
  nombre: "Usuario Test",
};

const productosMock = [
  {
    id: 1,
    nombre: "Cepillo de bambú",
    descripcion: "Cepillo ecológico biodegradable",
    precio: 12000,
    stockDisponible: 10,
    estado: "Disponible",
  },
  {
    id: 2,
    nombre: "Botella reutilizable",
    descripcion: "Botella ecológica reutilizable",
    precio: 28000,
    stockDisponible: 0,
    estado: "Agotado",
  },
];

const renderDashboard = (user = usuarioMock, logout = jest.fn()) => {
  return render(
    <AuthContext.Provider value={{ user, logout }}>
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<h1>Login</h1>} />
          <Route path="/carrito" element={<h1>Carrito</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("dashboard.jsx", () => {
  beforeEach(() => {
    global.fetch = jest.fn();

    window.scrollTo = jest.fn();

    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "confirm").mockImplementation(() => true);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("carga productos desde el backend y los muestra", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => productosMock,
    });

    renderDashboard();

    expect(screen.getByText("Cargando productos...")).toBeInTheDocument();

    expect(await screen.findByText("Cepillo de bambú")).toBeInTheDocument();
    expect(screen.getByText("Botella reutilizable")).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido, Usuario Test/i)).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/productos"
    );
  });

  test("muestra error si falla la carga de productos", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Error de conexión"));

    renderDashboard();

    expect(
      await screen.findByText("No se pudo conectar con el backend.")
    ).toBeInTheDocument();
  });

  test("filtra productos por estado disponible", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => productosMock,
    });

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: "Disponible" }));

    expect(screen.getByText("Cepillo de bambú")).toBeInTheDocument();
    expect(screen.queryByText("Botella reutilizable")).not.toBeInTheDocument();
    expect(screen.getByText(/Productos disponibles - Disponible/i)).toBeInTheDocument();
  });

  test("expande y contrae la información de un producto", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => productosMock,
    });

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    const botonesVerMas = screen.getAllByRole("button", { name: /ver más/i });

    await userEvent.click(botonesVerMas[0]);

    expect(screen.getByText(/Cepillo ecológico biodegradable/i)).toBeInTheDocument();
    expect(screen.getByText(/Stock:/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /ver menos/i }));

    expect(screen.queryByText(/Cepillo ecológico biodegradable/i)).not.toBeInTheDocument();
  });

  test("agrega un producto al carrito", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          mensaje: "Producto agregado al carrito.",
        }),
      });

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getAllByRole("button", { name: /agregar/i })[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/carrito",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            usuarioId: 1,
            productoId: 1,
          }),
        })
      );
    });

    expect(window.alert).toHaveBeenCalledWith("Producto agregado al carrito.");
  });

  test("redirige al carrito al presionar el botón carrito", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => productosMock,
    });

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: /carrito/i }));

    expect(screen.getByText("Carrito")).toBeInTheDocument();
  });

  test("crea un producto con datos válidos", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          mensaje: "Producto creado",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          ...productosMock,
          {
            id: 3,
            nombre: "Producto Test",
            descripcion: "Producto creado desde test",
            precio: 9999,
            stockDisponible: 5,
            estado: "Disponible",
          },
        ],
      });

    const { container } = renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.type(container.querySelector('input[name="nombre"]'), "Producto Test");
    await userEvent.type(
      container.querySelector('input[name="descripcion"]'),
      "Producto creado desde test"
    );
    await userEvent.type(container.querySelector('input[name="precio"]'), "9999");
    await userEvent.type(container.querySelector('input[name="stockDisponible"]'), "5");

    await userEvent.click(screen.getByRole("button", { name: /crear producto/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/productos",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            nombre: "Producto Test",
            descripcion: "Producto creado desde test",
            precio: 9999,
            stockDisponible: 5,
            estado: "Disponible",
          }),
        })
      );
    });

    expect(window.alert).toHaveBeenCalledWith("Producto creado correctamente.");
  });

  test("muestra alerta si intenta crear producto incompleto", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => productosMock,
    });

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: /crear producto/i }));

    expect(window.alert).toHaveBeenCalledWith(
      "Completa todos los campos del producto."
    );
  });

  test("prepara edición y actualiza un producto", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          mensaje: "Producto actualizado",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
      });

    const { container } = renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getAllByRole("button", { name: /editar/i })[0]);

    expect(screen.getByText("Editar producto")).toBeInTheDocument();

    const inputPrecio = container.querySelector('input[name="precio"]');

    await userEvent.clear(inputPrecio);
    await userEvent.type(inputPrecio, "15000");

    await userEvent.click(screen.getByRole("button", { name: /actualizar producto/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/productos/1",
        expect.objectContaining({
          method: "PUT",
        })
      );
    });

    expect(window.alert).toHaveBeenCalledWith("Producto actualizado correctamente.");
  });

  test("elimina un producto después de confirmar", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          mensaje: "Producto eliminado",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
      });

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getAllByRole("button", { name: /eliminar/i })[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        "¿Seguro que deseas eliminar este producto?"
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/productos/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  test("cierra sesión y navega al login", async () => {
    const logoutMock = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => productosMock,
    });

    renderDashboard(usuarioMock, logoutMock);

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    expect(logoutMock).toHaveBeenCalled();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
  test("filtra productos por estado agotado", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => productosMock,
  });

  renderDashboard();

  await screen.findByText("Cepillo de bambú");

  await userEvent.click(screen.getByRole("button", { name: "Agotado" }));

  expect(screen.getByText("Botella reutilizable")).toBeInTheDocument();
  expect(screen.queryByText("Cepillo de bambú")).not.toBeInTheDocument();
});
    test("vuelve a mostrar todos los productos al usar filtro todos", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
    });

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getByRole("button", { name: "Agotado" }));
    await userEvent.click(screen.getByRole("button", { name: "Todos" }));

    expect(screen.getByText("Cepillo de bambú")).toBeInTheDocument();
    expect(screen.getByText("Botella reutilizable")).toBeInTheDocument();
    });

    test("muestra alerta si intenta agregar un producto sin usuario", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
    });

    renderDashboard(null);

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getAllByRole("button", { name: /agregar/i })[0]);

    expect(window.alert).toHaveBeenCalled();
    });

    test("muestra alerta si falla al agregar producto al carrito", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
        })
        .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
            error: "No se pudo agregar el producto",
        }),
        });

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getAllByRole("button", { name: /agregar/i })[0]);

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });
    });

    test("muestra alerta si ocurre error de conexión al agregar producto", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
        })
        .mockRejectedValueOnce(new Error("Error de conexión"));

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getAllByRole("button", { name: /agregar/i })[0]);

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });

    expect(console.error).toHaveBeenCalled();
    });

    test("muestra alerta si falla la creación de producto desde el backend", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
        })
        .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
            error: "No se pudo crear el producto",
        }),
        });

    const { container } = renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.type(container.querySelector('input[name="nombre"]'), "Producto Error");
    await userEvent.type(container.querySelector('input[name="descripcion"]'), "Producto con error");
    await userEvent.type(container.querySelector('input[name="precio"]'), "9999");
    await userEvent.type(container.querySelector('input[name="stockDisponible"]'), "5");

    await userEvent.click(screen.getByRole("button", { name: /crear producto/i }));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });
    });

    test("muestra alerta si ocurre error de conexión al crear producto", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
        })
        .mockRejectedValueOnce(new Error("Error de conexión"));

    const { container } = renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.type(container.querySelector('input[name="nombre"]'), "Producto Error");
    await userEvent.type(container.querySelector('input[name="descripcion"]'), "Producto con error");
    await userEvent.type(container.querySelector('input[name="precio"]'), "9999");
    await userEvent.type(container.querySelector('input[name="stockDisponible"]'), "5");

    await userEvent.click(screen.getByRole("button", { name: /crear producto/i }));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });

    expect(console.error).toHaveBeenCalled();
    });

    test("cancela la edición de producto", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => productosMock,
  });

  renderDashboard();

  await screen.findByText("Cepillo de bambú");

  await userEvent.click(screen.getAllByRole("button", { name: /editar/i })[0]);

  expect(screen.getByText("Editar producto")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

  expect(screen.getByRole("button", { name: /crear producto/i })).toBeInTheDocument();
    });
    test("muestra alerta si falla la actualización de producto", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
        })
        .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
            error: "No se pudo actualizar el producto",
        }),
        });

    const { container } = renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getAllByRole("button", { name: /editar/i })[0]);

    const inputPrecio = container.querySelector('input[name="precio"]');

    await userEvent.clear(inputPrecio);
    await userEvent.type(inputPrecio, "15000");

    await userEvent.click(screen.getByRole("button", { name: /actualizar producto/i }));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });
    });

    test("muestra alerta si ocurre error de conexión al actualizar producto", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
        })
        .mockRejectedValueOnce(new Error("Error de conexión"));

    const { container } = renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getAllByRole("button", { name: /editar/i })[0]);

    const inputPrecio = container.querySelector('input[name="precio"]');

    await userEvent.clear(inputPrecio);
    await userEvent.type(inputPrecio, "15000");

    await userEvent.click(screen.getByRole("button", { name: /actualizar producto/i }));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });

    expect(console.error).toHaveBeenCalled();
    });

    test("no elimina producto si el usuario cancela confirmación", async () => {
    window.confirm.mockReturnValueOnce(false);

    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
    });

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getAllByRole("button", { name: /eliminar/i })[0]);

    expect(window.confirm).toHaveBeenCalled();

    expect(global.fetch).not.toHaveBeenCalledWith(
        "http://localhost:3000/api/productos/1",
        expect.objectContaining({
        method: "DELETE",
        })
    );
    });

    test("muestra alerta si falla la eliminación de producto", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
        })
        .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
            error: "No se pudo eliminar el producto",
        }),
        });

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getAllByRole("button", { name: /eliminar/i })[0]);

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });
    });

    test("muestra alerta si ocurre error de conexión al eliminar producto", async () => {
    global.fetch
        .mockResolvedValueOnce({
        ok: true,
        json: async () => productosMock,
        })
        .mockRejectedValueOnce(new Error("Error de conexión"));

    renderDashboard();

    await screen.findByText("Cepillo de bambú");

    await userEvent.click(screen.getAllByRole("button", { name: /eliminar/i })[0]);

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
    });

    expect(console.error).toHaveBeenCalled();
    });
});