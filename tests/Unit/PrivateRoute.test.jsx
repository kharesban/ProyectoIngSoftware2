import React from "react";
import { describe, test, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "../../src/Rutas/PrivateRoute";
import { AuthContext } from "../../src/Context/MyContext";

describe("PrivateRoute.jsx", () => {
  test("muestra el contenido privado cuando existe usuario autenticado", () => {
    render(
      <AuthContext.Provider value={{ user: { id: 1, nombre: "Usuario Test" } }}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <h1>Contenido privado</h1>
                </PrivateRoute>
              }
            />

            <Route path="/login" element={<h1>Login</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
  });

  test("redirige al login cuando no existe usuario autenticado", () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <h1>Contenido privado</h1>
                </PrivateRoute>
              }
            />

            <Route path="/login" element={<h1>Login</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
  });
});