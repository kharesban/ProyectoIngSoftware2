import { describe, test, expect, beforeEach } from "@jest/globals";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "../../src/Hooks/useAuth";

describe("useAuth.jsx", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("inicia sin usuario si localStorage está vacío", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBe(null);
  });

  test("carga el usuario guardado en localStorage", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        nombre: "Usuario Guardado",
      })
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: 1,
        nombre: "Usuario Guardado",
      });
    });
  });

  test("login guarda el usuario en estado y localStorage", () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login({
        id: 1,
        nombre: "Usuario Test",
      });
    });

    expect(result.current.user).toEqual({
      id: 1,
      nombre: "Usuario Test",
    });

    expect(JSON.parse(localStorage.getItem("user"))).toEqual({
      id: 1,
      nombre: "Usuario Test",
    });
  });

  test("logout elimina el usuario del estado y localStorage", () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login({
        id: 1,
        nombre: "Usuario Test",
      });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBe(null);
    expect(localStorage.getItem("user")).toBe(null);
  });
});