import React, { useContext } from "react";
import { describe, test, expect, beforeEach } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthContext, AuthProvider } from "../../src/Context/MyContext";

function ConsumidorDePrueba() {
  const { user, login, logout } = useContext(AuthContext);

  return (
    <div>
      <p data-testid="usuario">
        {user ? user.nombre : "Sin usuario"}
      </p>

      <button
        type="button"
        onClick={() =>
          login({
            id: 1,
            nombre: "Usuario Context",
          })
        }
      >
        Hacer login
      </button>

      <button type="button" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}

describe("MyContext.jsx", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("provee el contexto de autenticación a sus hijos", () => {
    render(
      <AuthProvider>
        <ConsumidorDePrueba />
      </AuthProvider>
    );

    expect(screen.getByTestId("usuario")).toHaveTextContent("Sin usuario");
    expect(screen.getByRole("button", { name: /hacer login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  test("permite hacer login desde el contexto", async () => {
    render(
      <AuthProvider>
        <ConsumidorDePrueba />
      </AuthProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: /hacer login/i }));

    await waitFor(() => {
      expect(screen.getByTestId("usuario")).toHaveTextContent("Usuario Context");
    });
  });

  test("permite cerrar sesión desde el contexto", async () => {
    render(
      <AuthProvider>
        <ConsumidorDePrueba />
      </AuthProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: /hacer login/i }));

    await waitFor(() => {
      expect(screen.getByTestId("usuario")).toHaveTextContent("Usuario Context");
    });

    await userEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    await waitFor(() => {
      expect(screen.getByTestId("usuario")).toHaveTextContent("Sin usuario");
    });
  });
});