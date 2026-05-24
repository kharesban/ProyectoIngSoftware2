import React from "react";
import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "../../src/Paginas/Login";
import { AuthContext } from "../../src/Context/MyContext";

const renderLogin = (loginMock = jest.fn()) => {
  return render(
    <AuthContext.Provider value={{ login: loginMock, user: null }}>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          <Route path="/register" element={<h1>Registro</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("Login.jsx", () => {
  beforeEach(() => {
    global.fetch = jest.fn();

    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renderiza la vista de login correctamente", () => {
    const { container } = renderLogin();

    expect(screen.getByText("Bienvenidos a EcoMart")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ingresar/i })).toBeInTheDocument();
    expect(screen.getByText(/Regístrate aquí/i)).toBeInTheDocument();
  });

  test("muestra alerta si intenta ingresar con campos vacíos", async () => {
    renderLogin();

    await userEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(window.alert).toHaveBeenCalledWith("Por favor completa todos los campos.");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("muestra alerta si falta la contraseña", async () => {
    const { container } = renderLogin();

    await userEvent.type(
      container.querySelector('input[type="email"]'),
      "usuario@test.com"
    );

    await userEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(window.alert).toHaveBeenCalledWith("Por favor completa todos los campos.");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("permite iniciar sesión correctamente y navega al dashboard", async () => {
    const loginMock = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        nombre: "Usuario Test",
        email: "usuario@test.com",
      }),
    });

    const { container } = renderLogin(loginMock);

    await userEvent.type(
      container.querySelector('input[type="email"]'),
      "usuario@test.com"
    );

    await userEvent.type(
      container.querySelector('input[type="password"]'),
      "123456"
    );

    await userEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/login",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "usuario@test.com",
            password: "123456",
          }),
        })
      );
    });

    expect(loginMock).toHaveBeenCalledWith({
      id: 1,
      nombre: "Usuario Test",
      email: "usuario@test.com",
    });

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  test("permite iniciar sesión cuando el backend responde dentro de usuario", async () => {
    const loginMock = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        usuario: {
          id: 2,
          nombre: "Usuario Anidado",
          email: "anidado@test.com",
        },
      }),
    });

    const { container } = renderLogin(loginMock);

    await userEvent.type(
      container.querySelector('input[type="email"]'),
      "anidado@test.com"
    );

    await userEvent.type(
      container.querySelector('input[type="password"]'),
      "123456"
    );

    await userEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        id: 2,
        nombre: "Usuario Anidado",
        email: "anidado@test.com",
      });
    });

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  test("muestra alerta cuando el backend rechaza las credenciales", async () => {
    const loginMock = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Email o contraseña incorrecta.",
      }),
    });

    const { container } = renderLogin(loginMock);

    await userEvent.type(
      container.querySelector('input[type="email"]'),
      "usuario@test.com"
    );

    await userEvent.type(
      container.querySelector('input[type="password"]'),
      "mala"
    );

    await userEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Email o contraseña incorrecta.");
    });

    expect(loginMock).not.toHaveBeenCalled();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  test("muestra mensaje genérico si el backend no envía error", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const { container } = renderLogin();

    await userEvent.type(
      container.querySelector('input[type="email"]'),
      "usuario@test.com"
    );

    await userEvent.type(
      container.querySelector('input[type="password"]'),
      "mala"
    );

    await userEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Email o contraseña incorrecta.");
    });
  });

  test("muestra alerta cuando no se puede conectar con el servidor", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Error de conexión"));

    const { container } = renderLogin();

    await userEvent.type(
      container.querySelector('input[type="email"]'),
      "usuario@test.com"
    );

    await userEvent.type(
      container.querySelector('input[type="password"]'),
      "123456"
    );

    await userEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("No se pudo conectar con el servidor.");
    });

    expect(console.error).toHaveBeenCalled();
  });

  test("navega hacia registro desde el enlace", async () => {
    renderLogin();

    await userEvent.click(screen.getByText(/Regístrate aquí/i));

    expect(screen.getByText("Registro")).toBeInTheDocument();
  });
});