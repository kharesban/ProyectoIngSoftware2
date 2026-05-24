/**
 * @jest-environment node
 */

const request = require("supertest");

const mockDb = {
  Usuario: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Producto: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Carrito: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  ItemCarrito: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  Pago: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn(),
    sync: jest.fn(),
  },
};

jest.mock("../../Backend/sqlModels", () => mockDb);

process.env.NODE_ENV = "test";

const app = require("../../Backend/server");

let transactionMock;

const crearUsuarioMock = () => ({
  id: 1,
  nombre: "Usuario Test",
  email: "usuario@test.com",
  password: "123456",
  update: jest.fn().mockResolvedValue(),
  destroy: jest.fn().mockResolvedValue(),
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      password: this.password,
    };
  },
});

const crearProductoMock = (datos = {}) => ({
  id: datos.id ?? 1,
  nombre: datos.nombre ?? "Cepillo de bambú",
  descripcion: datos.descripcion ?? "Cepillo ecológico",
  precio: datos.precio ?? 12000,
  stockDisponible: datos.stockDisponible ?? 10,
  estado: datos.estado ?? "Disponible",
  update: jest.fn().mockResolvedValue(),
  destroy: jest.fn().mockResolvedValue(),
});

const crearCarritoMock = (items = [], total = 12000) => ({
  id: 1,
  usuarioId: 1,
  estado: "Activo",
  total,
  ItemCarritos: items,
  update: jest.fn().mockResolvedValue(),
});

const crearItemMock = (producto = crearProductoMock(), cantidad = 1) => ({
  id: 1,
  carritoId: 1,
  productoId: producto.id,
  cantidad,
  precioUnitario: producto.precio,
  total: Number(producto.precio) * cantidad,
  Producto: producto,
  update: jest.fn().mockResolvedValue(),
  destroy: jest.fn().mockResolvedValue(),
});

beforeEach(() => {
  jest.clearAllMocks();

  transactionMock = {
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
  };

  mockDb.sequelize.transaction.mockResolvedValue(transactionMock);
  mockDb.sequelize.sync.mockResolvedValue();
});

describe("Backend/server.js - health", () => {
  test("GET /api/health responde OK", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "OK",
      message: "Backend con Sequelize funcionando",
    });
  });
});

describe("Backend/server.js - usuarios", () => {
  test("GET /api/usuarios obtiene usuarios", async () => {
    const usuario = crearUsuarioMock();

    mockDb.Usuario.findAll.mockResolvedValueOnce([usuario]);

    const response = await request(app).get("/api/usuarios");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(mockDb.Usuario.findAll).toHaveBeenCalled();
  });

  test("GET /api/usuarios maneja error interno", async () => {
    mockDb.Usuario.findAll.mockRejectedValueOnce(new Error("Error BD"));

    const response = await request(app).get("/api/usuarios");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Error BD");
  });

  test("GET /api/usuarios/:id obtiene usuario por id", async () => {
    const usuario = crearUsuarioMock();

    mockDb.Usuario.findByPk.mockResolvedValueOnce(usuario);

    const response = await request(app).get("/api/usuarios/1");

    expect(response.status).toBe(200);
    expect(response.body.nombre).toBe("Usuario Test");
  });

  test("GET /api/usuarios/:id responde 404 si no existe", async () => {
    mockDb.Usuario.findByPk.mockResolvedValueOnce(null);

    const response = await request(app).get("/api/usuarios/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Usuario no encontrado");
  });

  test("GET /api/usuarios/email/:email obtiene usuario por email", async () => {
    const usuario = crearUsuarioMock();

    mockDb.Usuario.findOne.mockResolvedValueOnce(usuario);

    const response = await request(app).get("/api/usuarios/email/usuario@test.com");

    expect(response.status).toBe(200);
    expect(response.body.email).toBe("usuario@test.com");
  });

  test("GET /api/usuarios/email/:email responde 404 si no existe", async () => {
    mockDb.Usuario.findOne.mockResolvedValueOnce(null);

    const response = await request(app).get("/api/usuarios/email/noexiste@test.com");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Usuario no encontrado");
  });

  test("POST /api/register rechaza campos incompletos", async () => {
    const response = await request(app).post("/api/register").send({
      nombre: "",
      email: "",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Todos los campos son obligatorios");
  });

  test("POST /api/register rechaza correo duplicado", async () => {
    mockDb.Usuario.findOne.mockResolvedValueOnce(crearUsuarioMock());

    const response = await request(app).post("/api/register").send({
      nombre: "Usuario Test",
      email: "usuario@test.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("El correo ya está registrado");
  });

  test("POST /api/register crea usuario correctamente", async () => {
    const usuario = crearUsuarioMock();

    mockDb.Usuario.findOne.mockResolvedValueOnce(null);
    mockDb.Usuario.create.mockResolvedValueOnce(usuario);

    const response = await request(app).post("/api/register").send({
      nombre: "Usuario Test",
      email: "usuario@test.com",
      password: "123456",
    });

    expect(response.status).toBe(201);
    expect(response.body.mensaje).toBe("Usuario registrado correctamente");
    expect(response.body.usuario.password).toBeUndefined();
  });

  test("POST /api/login rechaza usuario inexistente", async () => {
    mockDb.Usuario.findOne.mockResolvedValueOnce(null);

    const response = await request(app).post("/api/login").send({
      email: "usuario@test.com",
      password: "123456",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Credenciales inválidas");
  });

  test("POST /api/login rechaza contraseña incorrecta", async () => {
    mockDb.Usuario.findOne.mockResolvedValueOnce(crearUsuarioMock());

    const response = await request(app).post("/api/login").send({
      email: "usuario@test.com",
      password: "incorrecta",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Credenciales inválidas");
  });

  test("POST /api/login inicia sesión correctamente", async () => {
    mockDb.Usuario.findOne.mockResolvedValueOnce(crearUsuarioMock());

    const response = await request(app).post("/api/login").send({
      email: "usuario@test.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe("usuario@test.com");
    expect(response.body.password).toBeUndefined();
  });

  test("PUT /api/usuarios/:id actualiza usuario", async () => {
    const usuario = crearUsuarioMock();

    mockDb.Usuario.findByPk.mockResolvedValueOnce(usuario);

    const response = await request(app).put("/api/usuarios/1").send({
      nombre: "Usuario Editado",
    });

    expect(response.status).toBe(200);
    expect(usuario.update).toHaveBeenCalledWith({
      nombre: "Usuario Editado",
    });
  });

  test("PUT /api/usuarios/:id responde 404 si no existe", async () => {
    mockDb.Usuario.findByPk.mockResolvedValueOnce(null);

    const response = await request(app).put("/api/usuarios/999").send({
      nombre: "Usuario Editado",
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Usuario no encontrado");
  });

  test("DELETE /api/usuarios/:id elimina usuario", async () => {
    const usuario = crearUsuarioMock();

    mockDb.Usuario.findByPk.mockResolvedValueOnce(usuario);

    const response = await request(app).delete("/api/usuarios/1");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Usuario eliminado correctamente");
    expect(usuario.destroy).toHaveBeenCalled();
  });
});

describe("Backend/server.js - productos", () => {
  test("GET /api/productos obtiene productos", async () => {
    mockDb.Producto.findAll.mockResolvedValueOnce([crearProductoMock()]);

    const response = await request(app).get("/api/productos");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("GET /api/productos/:id obtiene producto", async () => {
    mockDb.Producto.findByPk.mockResolvedValueOnce(crearProductoMock());

    const response = await request(app).get("/api/productos/1");

    expect(response.status).toBe(200);
    expect(response.body.nombre).toBe("Cepillo de bambú");
  });

  test("GET /api/productos/:id responde 404 si no existe", async () => {
    mockDb.Producto.findByPk.mockResolvedValueOnce(null);

    const response = await request(app).get("/api/productos/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Producto no encontrado");
  });

  test("POST /api/productos rechaza datos incompletos", async () => {
    const response = await request(app).post("/api/productos").send({
      nombre: "",
      descripcion: "",
      precio: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Nombre, descripción, precio y stock son obligatorios");
  });

  test("POST /api/productos crea producto", async () => {
    mockDb.Producto.create.mockResolvedValueOnce(crearProductoMock());

    const response = await request(app).post("/api/productos").send({
      nombre: "Cepillo de bambú",
      descripcion: "Cepillo ecológico",
      precio: 12000,
      stockDisponible: 10,
      estado: "Disponible",
    });

    expect(response.status).toBe(201);
    expect(response.body.mensaje).toBe("Producto creado correctamente");
  });

  test("PUT /api/productos/:id actualiza producto", async () => {
    const producto = crearProductoMock();

    mockDb.Producto.findByPk.mockResolvedValueOnce(producto);

    const response = await request(app).put("/api/productos/1").send({
      nombre: "Producto Editado",
      descripcion: "Descripción editada",
      precio: 15000,
      stockDisponible: 5,
      estado: "Disponible",
    });

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe("Producto actualizado correctamente");
    expect(producto.update).toHaveBeenCalled();
  });

  test("PUT /api/productos/:id responde 404 si no existe", async () => {
    mockDb.Producto.findByPk.mockResolvedValueOnce(null);

    const response = await request(app).put("/api/productos/999").send({
      nombre: "Producto Editado",
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Producto no encontrado");
  });

  test("DELETE /api/productos/:id elimina producto", async () => {
    const producto = crearProductoMock();

    mockDb.Producto.findByPk.mockResolvedValueOnce(producto);

    const response = await request(app).delete("/api/productos/1");

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe("Producto eliminado correctamente");
    expect(producto.destroy).toHaveBeenCalled();
  });

  test("DELETE /api/productos/:id responde 404 si no existe", async () => {
    mockDb.Producto.findByPk.mockResolvedValueOnce(null);

    const response = await request(app).delete("/api/productos/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Producto no encontrado");
  });
});

describe("Backend/server.js - carrito", () => {
  test("GET /api/carrito/:usuarioId devuelve carrito vacío si no existe", async () => {
    mockDb.Carrito.findOne.mockResolvedValueOnce(null);

    const response = await request(app).get("/api/carrito/1");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(0);
    expect(response.body.ItemCarritos).toEqual([]);
  });

  test("GET /api/carrito/:usuarioId devuelve carrito activo", async () => {
    const item = crearItemMock();
    const carrito = crearCarritoMock([item]);

    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);

    const response = await request(app).get("/api/carrito/1");

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
    expect(response.body.ItemCarritos).toHaveLength(1);
  });

  test("POST /api/carrito rechaza datos incompletos", async () => {
    const response = await request(app).post("/api/carrito").send({
      usuarioId: null,
      productoId: null,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("usuarioId y productoId son obligatorios");
  });

  test("POST /api/carrito rechaza producto inexistente", async () => {
    mockDb.Producto.findByPk.mockResolvedValueOnce(null);

    const response = await request(app).post("/api/carrito").send({
      usuarioId: 1,
      productoId: 99,
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Producto no encontrado");
  });

  test("POST /api/carrito crea carrito e item si no existen", async () => {
    const producto = crearProductoMock();
    const carrito = crearCarritoMock([]);
    const item = crearItemMock(producto);

    mockDb.Producto.findByPk.mockResolvedValueOnce(producto);
    mockDb.Carrito.findOne.mockResolvedValueOnce(null);
    mockDb.Carrito.create.mockResolvedValueOnce(carrito);
    mockDb.ItemCarrito.findOne.mockResolvedValueOnce(null);
    mockDb.ItemCarrito.create.mockResolvedValueOnce(item);
    mockDb.ItemCarrito.findAll.mockResolvedValueOnce([item]);
    mockDb.Carrito.findByPk.mockResolvedValueOnce(carrito);

    const response = await request(app).post("/api/carrito").send({
      usuarioId: 1,
      productoId: 1,
    });

    expect(response.status).toBe(201);
    expect(response.body.mensaje).toBe("Producto agregado al carrito");
    expect(mockDb.Carrito.create).toHaveBeenCalled();
    expect(mockDb.ItemCarrito.create).toHaveBeenCalled();
  });

  test("POST /api/carrito aumenta cantidad si el item ya existe", async () => {
    const producto = crearProductoMock();
    const item = crearItemMock(producto, 1);
    const carrito = crearCarritoMock([item]);

    mockDb.Producto.findByPk.mockResolvedValueOnce(producto);
    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);
    mockDb.ItemCarrito.findOne.mockResolvedValueOnce(item);
    mockDb.ItemCarrito.findAll.mockResolvedValueOnce([item]);
    mockDb.Carrito.findByPk.mockResolvedValueOnce(carrito);

    const response = await request(app).post("/api/carrito").send({
      usuarioId: 1,
      productoId: 1,
    });

    expect(response.status).toBe(201);
    expect(item.update).toHaveBeenCalledWith({
      cantidad: 2,
      total: 24000,
    });
  });

  test("PUT /api/carrito/item/:itemId actualiza cantidad", async () => {
    const item = crearItemMock();
    const carrito = crearCarritoMock([item]);

    mockDb.ItemCarrito.findByPk.mockResolvedValueOnce(item);
    mockDb.ItemCarrito.findAll.mockResolvedValueOnce([item]);
    mockDb.Carrito.findByPk.mockResolvedValueOnce(carrito);

    const response = await request(app).put("/api/carrito/item/1").send({
      cantidad: 3,
    });

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe("Cantidad actualizada");
    expect(item.update).toHaveBeenCalledWith({
      cantidad: 3,
      total: 36000,
    });
  });

  test("PUT /api/carrito/item/:itemId elimina item si cantidad es 0", async () => {
    const item = crearItemMock();
    const carrito = crearCarritoMock([]);

    mockDb.ItemCarrito.findByPk.mockResolvedValueOnce(item);
    mockDb.ItemCarrito.findAll.mockResolvedValueOnce([]);
    mockDb.Carrito.findByPk.mockResolvedValueOnce(carrito);

    const response = await request(app).put("/api/carrito/item/1").send({
      cantidad: 0,
    });

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe("Producto eliminado del carrito");
    expect(item.destroy).toHaveBeenCalled();
  });

  test("PUT /api/carrito/item/:itemId responde 404 si item no existe", async () => {
    mockDb.ItemCarrito.findByPk.mockResolvedValueOnce(null);

    const response = await request(app).put("/api/carrito/item/999").send({
      cantidad: 1,
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Item no encontrado en el carrito");
  });

  test("DELETE /api/carrito/item/:itemId elimina item", async () => {
    const item = crearItemMock();
    const carrito = crearCarritoMock([]);

    mockDb.ItemCarrito.findByPk.mockResolvedValueOnce(item);
    mockDb.ItemCarrito.findAll.mockResolvedValueOnce([]);
    mockDb.Carrito.findByPk.mockResolvedValueOnce(carrito);

    const response = await request(app).delete("/api/carrito/item/1");

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe("Producto eliminado del carrito");
    expect(item.destroy).toHaveBeenCalled();
  });

  test("DELETE /api/carrito/item/:itemId responde 404 si no existe", async () => {
    mockDb.ItemCarrito.findByPk.mockResolvedValueOnce(null);

    const response = await request(app).delete("/api/carrito/item/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Item no encontrado en el carrito");
  });

  test("DELETE /api/carrito/usuario/:usuarioId responde si no hay carrito", async () => {
    mockDb.Carrito.findOne.mockResolvedValueOnce(null);

    const response = await request(app).delete("/api/carrito/usuario/1");

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe("El usuario no tiene carrito activo");
  });

  test("DELETE /api/carrito/usuario/:usuarioId vacía carrito", async () => {
    const carrito = crearCarritoMock([]);

    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);
    mockDb.ItemCarrito.destroy.mockResolvedValueOnce();

    const response = await request(app).delete("/api/carrito/usuario/1");

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe("Carrito vaciado correctamente");
    expect(mockDb.ItemCarrito.destroy).toHaveBeenCalledWith({
      where: {
        carritoId: 1,
      },
    });
    expect(carrito.update).toHaveBeenCalledWith({
      total: 0,
    });
  });
});

describe("Backend/server.js - pagos", () => {
  test("POST /api/pagos/procesar rechaza datos obligatorios faltantes", async () => {
    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
    });

    expect(response.status).toBe(400);
    expect(transactionMock.rollback).toHaveBeenCalled();
  });

  test("POST /api/pagos/procesar rechaza si no hay carrito activo", async () => {
    mockDb.Carrito.findOne.mockResolvedValueOnce(null);

    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
      metodoPago: "credito",
      nombreTitular: "Usuario Test",
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("No hay carrito activo para este usuario");
    expect(transactionMock.rollback).toHaveBeenCalled();
  });

  test("POST /api/pagos/procesar rechaza carrito vacío", async () => {
    mockDb.Carrito.findOne.mockResolvedValueOnce(crearCarritoMock([], 0));

    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
      metodoPago: "credito",
      nombreTitular: "Usuario Test",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("El carrito está vacío");
    expect(transactionMock.rollback).toHaveBeenCalled();
  });

  test("POST /api/pagos/procesar rechaza total inválido", async () => {
    const producto = crearProductoMock();
    const item = crearItemMock(producto);
    const carrito = crearCarritoMock([item], 0);

    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);

    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
      metodoPago: "contraEntrega",
      nombreTitular: "Usuario Test",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("El total del carrito no es válido");
  });

  test("POST /api/pagos/procesar rechaza tarjeta incompleta", async () => {
    const producto = crearProductoMock();
    const item = crearItemMock(producto);
    const carrito = crearCarritoMock([item], 12000);

    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);

    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
      metodoPago: "credito",
      nombreTitular: "Usuario Test",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Los datos de la tarjeta son obligatorios");
  });

  test("POST /api/pagos/procesar rechaza tarjeta inválida por Luhn", async () => {
    const producto = crearProductoMock();
    const item = crearItemMock(producto);
    const carrito = crearCarritoMock([item], 12000);

    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);

    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
      metodoPago: "credito",
      nombreTitular: "Usuario Test",
      numeroTarjeta: "1234567890123456",
      fechaExpiracion: "12/99",
      cvv: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Número de tarjeta inválido según el algoritmo de Luhn");
  });

  test("POST /api/pagos/procesar rechaza fecha vencida", async () => {
    const producto = crearProductoMock();
    const item = crearItemMock(producto);
    const carrito = crearCarritoMock([item], 12000);

    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);

    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
      metodoPago: "credito",
      nombreTitular: "Usuario Test",
      numeroTarjeta: "4111111111111111",
      fechaExpiracion: "01/20",
      cvv: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("La fecha de vencimiento es inválida o la tarjeta está vencida");
  });

  test("POST /api/pagos/procesar rechaza CVV inválido", async () => {
    const producto = crearProductoMock();
    const item = crearItemMock(producto);
    const carrito = crearCarritoMock([item], 12000);

    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);

    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
      metodoPago: "credito",
      nombreTitular: "Usuario Test",
      numeroTarjeta: "4111111111111111",
      fechaExpiracion: "12/99",
      cvv: "12A",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("CVV inválido");
  });

  test("POST /api/pagos/procesar rechaza producto inexistente en carrito", async () => {
  const item = {
    id: 1,
    carritoId: 1,
    productoId: 999,
    cantidad: 1,
    precioUnitario: 12000,
    total: 12000,
    Producto: null,
    update: jest.fn().mockResolvedValue(),
    destroy: jest.fn().mockResolvedValue(),
  };

  const carrito = crearCarritoMock([item], 12000);

  mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);

  const response = await request(app).post("/api/pagos/procesar").send({
    usuarioId: 1,
    metodoPago: "contraEntrega",
    nombreTitular: "Usuario Test",
  });

  expect(response.status).toBe(404);
  expect(response.body.error).toBe("Uno de los productos del carrito no existe");
  expect(transactionMock.rollback).toHaveBeenCalled();
});

  test("POST /api/pagos/procesar rechaza stock insuficiente", async () => {
    const producto = crearProductoMock({
      nombre: "Producto sin stock",
      stockDisponible: 1,
    });

    const item = crearItemMock(producto, 2);
    const carrito = crearCarritoMock([item], 24000);

    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);

    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
      metodoPago: "contraEntrega",
      nombreTitular: "Usuario Test",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("No hay stock suficiente para el producto: Producto sin stock");
  });

  test("POST /api/pagos/procesar aprueba pago con crédito", async () => {
    const producto = crearProductoMock({
      stockDisponible: 10,
    });

    const item = crearItemMock(producto, 2);
    const carrito = crearCarritoMock([item], 24000);

    const pagoMock = {
      id: 1,
      estado: "Aprobado",
      total: 24000,
    };

    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);
    mockDb.Pago.create.mockResolvedValueOnce(pagoMock);

    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
      metodoPago: "credito",
      nombreTitular: "Usuario Test",
      numeroTarjeta: "4111111111111111",
      fechaExpiracion: "12/99",
      cvv: "123",
    });

    expect(response.status).toBe(201);
    expect(response.body.mensaje).toBe("Pago aprobado correctamente");

    expect(producto.update).toHaveBeenCalledWith(
      {
        stockDisponible: 8,
        estado: "Disponible",
      },
      { transaction: transactionMock }
    );

    expect(mockDb.Pago.create).toHaveBeenCalledWith(
      expect.objectContaining({
        carritoId: 1,
        usuarioId: 1,
        metodoPago: "credito",
        ultimosDigitos: "1111",
        total: 24000,
        estado: "Aprobado",
      }),
      { transaction: transactionMock }
    );

    expect(carrito.update).toHaveBeenCalledWith(
      {
        estado: "Pagado",
      },
      { transaction: transactionMock }
    );

    expect(transactionMock.commit).toHaveBeenCalled();
  });

  test("POST /api/pagos/procesar aprueba pago contra entrega sin tarjeta", async () => {
    const producto = crearProductoMock({
      stockDisponible: 10,
    });

    const item = crearItemMock(producto, 1);
    const carrito = crearCarritoMock([item], 12000);

    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);
    mockDb.Pago.create.mockResolvedValueOnce({
      id: 1,
      estado: "Aprobado",
    });

    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
      metodoPago: "contraEntrega",
      nombreTitular: "Usuario Test",
    });

    expect(response.status).toBe(201);
    expect(mockDb.Pago.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metodoPago: "contraEntrega",
        ultimosDigitos: "N/A",
      }),
      { transaction: transactionMock }
    );
    expect(transactionMock.commit).toHaveBeenCalled();
  });

  test("POST /api/pagos/procesar maneja error interno y hace rollback", async () => {
    const producto = crearProductoMock();
    const item = crearItemMock(producto, 1);
    const carrito = crearCarritoMock([item], 12000);

    mockDb.Carrito.findOne.mockResolvedValueOnce(carrito);
    mockDb.Pago.create.mockRejectedValueOnce(new Error("Error al guardar pago"));

    const response = await request(app).post("/api/pagos/procesar").send({
      usuarioId: 1,
      metodoPago: "contraEntrega",
      nombreTitular: "Usuario Test",
    });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Error al guardar pago");
    expect(transactionMock.rollback).toHaveBeenCalled();
  });

  test("GET /api/pagos/usuario/:usuarioId obtiene pagos", async () => {
    mockDb.Pago.findAll.mockResolvedValueOnce([
      {
        id: 1,
        usuarioId: 1,
        total: 24000,
      },
    ]);

    const response = await request(app).get("/api/pagos/usuario/1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("GET /api/pagos/usuario/:usuarioId maneja error interno", async () => {
    mockDb.Pago.findAll.mockRejectedValueOnce(new Error("Error pagos"));

    const response = await request(app).get("/api/pagos/usuario/1");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Error pagos");
  });
});