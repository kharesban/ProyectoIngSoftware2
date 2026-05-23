import { test, expect } from "@playwright/test";

const usuarioMock = {
  id: 1,
  nombre: "Usuario E2E",
  email: "usuarioe2e@ecomart.com",
};

const productoMock = {
  id: 1,
  nombre: "Cepillo de bambú",
  descripcion: "Cepillo ecológico biodegradable",
  precio: 12000,
  stockDisponible: 10,
  estado: "Disponible",
};

async function mockBackend(page) {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === "/api/login" && method === "POST") {
      const body = JSON.parse(request.postData() || "{}");

      if (
        body.email === "usuarioe2e@ecomart.com" &&
        body.password === "123456"
      ) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(usuarioMock),
        });
      }

      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Email o contraseña incorrecta.",
        }),
      });
    }

    if (path === "/api/productos" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([productoMock]),
      });
    }

    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        error: `Mock no configurado para ${method} ${path}`,
      }),
    });
  });
}

test.describe("EcoMart - Login E2E", () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page);
  });

  test("permite iniciar sesión correctamente y entrar al dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("Email").fill("usuarioe2e@ecomart.com");
    await page.getByPlaceholder("Contraseña").fill("123456");

    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Bienvenido, Usuario E2E/i)).toBeVisible();
    await expect(page.getByText(/Productos disponibles/i)).toBeVisible();
    await expect(page.getByText("Cepillo de bambú")).toBeVisible();
  });

  test("muestra error cuando las credenciales son incorrectas", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("Email").fill("usuarioe2e@ecomart.com");
    await page.getByPlaceholder("Contraseña").fill("claveIncorrecta");

    const alerta = page.waitForEvent("dialog");

    await page.getByRole("button", { name: "Ingresar" }).click();

    const dialog = await alerta;

    expect(dialog.message()).toContain("Email o contraseña incorrecta.");

    await dialog.accept();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Login")).toBeVisible();
  });
});
