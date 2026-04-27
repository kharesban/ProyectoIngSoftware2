import { test, expect } from '@jest/globals';

function validarLogin(user, contra) {
  if (user === "admin" && contra === "123") {
    return true;
  } else {
    return false;
  }
}

test('login correcto', () => {
  expect(validarLogin("admin", "123")).toBe(true);
});

test('login incorrecto', () => {
  expect(validarLogin("admin", "wrong")).toBe(false);
});

test('usuario vacío', () => {
  expect(validarLogin("", "123")).toBe(false);
});

test('contraseña vacía', () => {
  expect(validarLogin("admin", "")).toBe(false);
});