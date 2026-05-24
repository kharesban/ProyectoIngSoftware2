import React from "react";
import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Register from "../../src/Paginas/Register";

const renderRegister = () => {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
    </MemoryRouter>
  );
};

const llenarFormularioRegistro = async (container, datos = {}) => {
  const inputs = container.querySelectorAll("input");

  await userEvent.clear(inputs[0]);
  await userEvent.type(inputs[0], datos.nombre ?? "Usuario Test");

  await userEvent.clear(inputs[1]);
  await userEvent.type(inputs[1], datos.email ?? "usuario@test.com");

  await userEvent.clear(inputs[2]);
  await userEvent.type(inputs[2], datos.password ?? "123456");

  await userEvent.clear(inputs[3]);
  await userEvent.type(inputs[3], datos.confirmarPassword ?? "123456");
};

describe("Register.jsx", () => {
  beforeEach(() => {
    global.fetch = jest.fn();

    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renderiza la vista de registro correctamente", () => {
    const { container } = renderRegister();

    expect(screen.getByText("Bienvenidos a EcoMart")).toBeInTheDocument();
    expect(screen.getByText("Registro de nuevo usuario")).toBeInTheDocument();
    expect(container.querySelectorAll("input")).toHaveLength(4);
    expect(screen.getByRole("button", { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByText(/Inicia sesión aquí/i)).toBeInTheDocument();
  });

  test("muestra error si el nombre está vacío", async () => {
    const { container } = renderRegister();

    await llenarFormularioRegistro(container, {
      nombre: " ",
      email: "usuario@test.com",
      password: "123456",
      confirmarPassword: "123456",
    });

    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(screen.getByText("El nombre es requerido")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("muestra error si el email está vacío", async () => {
    const { container } = renderRegister();

    await llenarFormularioRegistro(container, {
      nombre: "Usuario Test",
      email: " ",
      password: "123456",
      confirmarPassword: "123456",
    });

    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(screen.getByText("El email es requerido")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("muestra error si el email no es válido", async () => {
    const { container } = renderRegister();

    await llenarFormularioRegistro(container, {
      nombre: "Usuario Test",
      email: "correo-invalido",
      password: "123456",
      confirmarPassword: "123456",
    });

    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(screen.getByText("Ingresa un email válido")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("muestra error si la contraseña tiene menos de 6 caracteres", async () => {
    const { container } = renderRegister();

    await llenarFormularioRegistro(container, {
      nombre: "Usuario Test",
      email: "usuario@test.com",
      password: "123",
      confirmarPassword: "123",
    });

    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(screen.getByText("La contraseña debe tener al menos 6 caracteres")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("muestra error si las contraseñas no coinciden", async () => {
    const { container } = renderRegister();

    await llenarFormularioRegistro(container, {
      nombre: "Usuario Test",
      email: "usuario@test.com",
      password: "123456",
      confirmarPassword: "654321",
    });

    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("registra usuario correctamente y navega al login", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        mensaje: "Usuario registrado correctamente",
      }),
    });

    const { container } = renderRegister();

    await llenarFormularioRegistro(container, {
      nombre: "Usuario Test",
      email: "usuario@test.com",
      password: "123456",
      confirmarPassword: "123456",
    });

    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/register",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: "Usuario Test",
            email: "usuario@test.com",
            password: "123456",
          }),
        })
      );
    });

    expect(window.alert).toHaveBeenCalledWith("Usuario registrado exitosamente");
    expect(await screen.findByText("Login")).toBeInTheDocument();
  });

  test("muestra error cuando el backend rechaza el registro", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "El correo ya está registrado",
      }),
    });

    const { container } = renderRegister();

    await llenarFormularioRegistro(container);

    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText("El correo ya está registrado")).toBeInTheDocument();
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("muestra error genérico si el backend no envía mensaje", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const { container } = renderRegister();

    await llenarFormularioRegistro(container);

    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText("No se pudo registrar el usuario.")).toBeInTheDocument();
  });

  test("muestra error cuando no se puede conectar con el servidor", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Error de conexión"));

    const { container } = renderRegister();

    await llenarFormularioRegistro(container);

    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText("No se pudo conectar con el servidor.")).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  test("navega hacia login desde el enlace", async () => {
    renderRegister();

    await userEvent.click(screen.getByText(/Inicia sesión aquí/i));

    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});