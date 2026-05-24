import { test, expect } from "@playwright/test";

const FRONT_URL = "http://localhost:5173";
const API_URL = "http://localhost:3000";

const crearUsuarioE2E = async (request) => {
  const fecha = Date.now();

  const usuario = {
    nombre: `Usuario E2E ${fecha}`,
    email: `usuarioe2e${fecha}@ecomart.com`,
    password: "123456",
  };

  const response = await request.post(`${API_URL}/api/register`, {
    data: usuario,
  });

  expect(response.ok()).toBeTruthy();

  const data = await response.json();

  return {
    ...usuario,
    id: data.usuario?.id,
  };
};

const loginDesdeInterfaz = async (page, usuario) => {
  await page.goto(`${FRONT_URL}/login`);

  await page.locator('input[type="email"], input[name="email"], input[name="correo"]').first().fill(usuario.email);
  await page.locator('input[type="password"]').first().fill(usuario.password);

  await page.getByRole("button", { name: /ingresar/i }).click();

  await expect(page).toHaveURL(/\/dashboard/);
};

test.describe("EcoMart - pruebas E2E", () => {
  test("1. permite registrar un usuario nuevo desde la interfaz", async ({ page }) => {
    const fecha = Date.now();

    await page.goto(`${FRONT_URL}/register`);

    const inputs = page.locator("input");

    await inputs.nth(0).fill(`Registro E2E ${fecha}`);
    await inputs.nth(1).fill(`registroe2e${fecha}@ecomart.com`);
    await inputs.nth(2).fill("123456");
    await inputs.nth(3).fill("123456");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.getByRole("button", { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test("2. permite iniciar sesión correctamente", async ({ page, request }) => {
    const usuario = await crearUsuarioE2E(request);

    await loginDesdeInterfaz(page, usuario);

    await expect(page.getByText(new RegExp(`Bienvenido, ${usuario.nombre}`, "i"))).toBeVisible();
    await expect(page.getByText(/productos disponibles/i)).toBeVisible();
  });

  test("3. muestra error cuando las credenciales son incorrectas", async ({ page, request }) => {
    const usuario = await crearUsuarioE2E(request);

    await page.goto(`${FRONT_URL}/login`);

    await page.locator('input[type="email"], input[name="email"], input[name="correo"]').first().fill(usuario.email);
    await page.locator('input[type="password"]').first().fill("claveIncorrecta");

    const alerta = page.waitForEvent("dialog");

    await page.getByRole("button", { name: /ingresar/i }).click();

    const dialog = await alerta;

    expect(dialog.message()).toMatch(/incorrecta|inválida|credenciales/i);

    await dialog.accept();

    await expect(page).toHaveURL(/\/login/);
  });

  test("4. muestra productos reales cargados desde el backend", async ({ page, request }) => {
    const usuario = await crearUsuarioE2E(request);

    await loginDesdeInterfaz(page, usuario);

    await expect(page.getByText(/productos disponibles/i)).toBeVisible();

    const botonesAgregar = page.getByRole("button", { name: /agregar/i });

    await expect(botonesAgregar.first()).toBeVisible();
  });
  test("5. permite crear un producto desde el dashboard", async ({ page, request }) => {
  const usuario = await crearUsuarioE2E(request);
  const fecha = Date.now();
  const nombreProducto = `Producto E2E ${fecha}`;

  await loginDesdeInterfaz(page, usuario);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  const inputs = page.locator("input:not([type='radio']):not([type='checkbox']):not([type='hidden'])");

  await inputs.nth(0).fill(nombreProducto);
  await inputs.nth(1).fill("Producto creado desde prueba E2E real");
  await inputs.nth(2).fill("9999");
  await inputs.nth(3).fill("15");

  const selectEstado = page.locator("select").first();
  await selectEstado.selectOption("Disponible");

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  const respuestaCrearProducto = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/productos") &&
      response.request().method() === "POST"
    );
  });

  await page.getByRole("button", { name: /crear producto/i }).click();

  const response = await respuestaCrearProducto;
  expect(response.ok()).toBeTruthy();

  const respuestaProductos = await request.get(`${API_URL}/api/productos`);
  expect(respuestaProductos.ok()).toBeTruthy();

  const productos = await respuestaProductos.json();

  const productoCreado = productos.find((producto) => {
    return producto.nombre === nombreProducto;
  });

  expect(productoCreado).toBeTruthy();
  expect(Number(productoCreado.precio)).toBe(9999);
  expect(Number(productoCreado.stockDisponible)).toBe(15);
  });
  test("6. permite agregar un producto real al carrito", async ({ page, request }) => {
    const usuario = await crearUsuarioE2E(request);

    await loginDesdeInterfaz(page, usuario);

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.getByRole("button", { name: /agregar/i }).first().click();

    await page.getByRole("button", { name: /carrito/i }).click();

    await expect(page).toHaveURL(/\/carrito/);
    await expect(page.getByText(/productos en el carrito/i)).toBeVisible();
    await expect(page.getByText(/cantidad/i).first()).toBeVisible();
  });

  test("7. permite aumentar y disminuir cantidad del carrito", async ({ page, request }) => {
    const usuario = await crearUsuarioE2E(request);

    await loginDesdeInterfaz(page, usuario);

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.getByRole("button", { name: /agregar/i }).first().click();
    await page.getByRole("button", { name: /carrito/i }).click();

    await page.getByRole("button", { name: "+" }).first().click();
    await expect(page.getByText(/cantidad:\s*2/i)).toBeVisible();

    await page.getByRole("button", { name: "-" }).first().click();
    await expect(page.getByText(/cantidad:\s*1/i)).toBeVisible();
  });
  test("8. permite procesar pago con tarjeta válida y Luhn correcto", async ({ page, request }) => {
  const usuario = await crearUsuarioE2E(request);

  await loginDesdeInterfaz(page, usuario);

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page.getByRole("button", { name: /agregar/i }).first().click();

  await page.getByRole("button", { name: /carrito/i }).click();

  await expect(page).toHaveURL(/\/carrito/);
  await expect(page.getByText(/productos en el carrito/i)).toBeVisible();

  await page.getByRole("button", { name: /proceder al pago/i }).click();

  await expect(page).toHaveURL(/\/pasarela-pagos/);
  await page.waitForLoadState("networkidle");

  await page.locator('input[name="nombre"]').fill(usuario.nombre);
  await page.locator('input[name="documento"]').fill("1234567890");
  await page.locator('input[name="telefono"]').fill("3001234567");
  await page.locator('input[name="correo"]').fill(usuario.email);

  await page.locator('input[name="metodoPago"][value="credito"]').check({
    force: true,
  });

  await expect(page.getByText(/pago con tarjeta de crédito/i)).toBeVisible({
    timeout: 10000,
  });

  await page.locator('input[name="nombreTitular"]').fill(usuario.nombre);
  await page.locator('input[name="numeroTarjeta"]').fill("4111111111111111");
  await page.locator('input[name="fechaVencimiento"]').fill("12/29");
  await page.locator('input[name="cvv"]').fill("123");

  await page.locator('select[name="cuotas"]').selectOption("1");

  const respuestaPago = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/pagos/procesar") &&
      response.request().method() === "POST"
    );
  });

  await page.getByRole("button", { name: /confirmar pago/i }).click();

  const response = await respuestaPago;
  expect(response.ok()).toBeTruthy();

  await expect(
    page.getByText(/pago aprobado correctamente|pago registrado correctamente/i)
  ).toBeVisible({ timeout: 10000 });
  });
});