create database EcoMart;
Use EcoMart;

CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL
);

CREATE TABLE Producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stockDisponible INT NOT NULL,
    estado VARCHAR(50)
);

CREATE TABLE Carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuarioId INT,
    estado VARCHAR(50),
    total DECIMAL(10,2) DEFAULT 0,

    FOREIGN KEY (usuarioId) REFERENCES Usuario(id)
);

CREATE TABLE ItemCarrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carritoId INT,
    productoId INT,
    cantidad INT NOT NULL,
    precioUnitario DECIMAL(10,2),
    total DECIMAL(10,2),

    FOREIGN KEY (carritoId) REFERENCES Carrito(id),
    FOREIGN KEY (productoId) REFERENCES Producto(id)
);

CREATE TABLE Pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carritoId INT NOT NULL,
    usuarioId INT NOT NULL,
    metodoPago VARCHAR(50) NOT NULL,
    ultimosDigitos VARCHAR(4) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    fechaPago DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carritoId) REFERENCES Carrito(id),
    FOREIGN KEY (usuarioId) REFERENCES Usuario(id)
);

#Trigger para update

DELIMITER $$

CREATE TRIGGER actualizar_item_carrito
BEFORE UPDATE ON ItemCarrito
FOR EACH ROW
BEGIN
    SET NEW.total = NEW.cantidad * NEW.precioUnitario;
END$$

DELIMITER ;

#Trigger para recalcular carrito en update

DELIMITER $$

CREATE TRIGGER actualizar_total_carrito_update
AFTER UPDATE ON ItemCarrito
FOR EACH ROW
BEGIN
    UPDATE Carrito
    SET total = (
        SELECT SUM(total)
        FROM ItemCarrito
        WHERE carritoId = NEW.carritoId
    )
    WHERE id = NEW.carritoId;
END$$

DELIMITER ;

#Trigger para Delete

DELIMITER $$

CREATE TRIGGER actualizar_total_carrito_delete
AFTER DELETE ON ItemCarrito
FOR EACH ROW
BEGIN
    UPDATE Carrito
    SET total = (
        SELECT IFNULL(SUM(total), 0)
        FROM ItemCarrito
        WHERE carritoId = OLD.carritoId
    )
    WHERE id = OLD.carritoId;
END$$

DELIMITER ;

#Trigger calcular total item

DELIMITER $$

CREATE TRIGGER calcular_total_item
BEFORE INSERT ON ItemCarrito
FOR EACH ROW
BEGIN
    SET NEW.total = NEW.cantidad * NEW.precioUnitario;
END$$

DELIMITER ;

#Trigger automatico de precio

DELIMITER $$

CREATE TRIGGER asignar_precio_producto
BEFORE INSERT ON ItemCarrito
FOR EACH ROW
BEGIN
    DECLARE precio DECIMAL(10,2);

    SELECT p.precio INTO precio
    FROM Producto p
    WHERE p.id = NEW.productoId;

    SET NEW.precioUnitario = precio;
END$$

DELIMITER ;

#Trigger para controlar stock 

DELIMITER $$

CREATE TRIGGER validar_stock
BEFORE INSERT ON ItemCarrito
FOR EACH ROW
BEGIN
    DECLARE stock INT;

    SELECT stockDisponible INTO stock
    FROM Producto
    WHERE id = NEW.productoId;

    IF stock < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente';
    END IF;
END$$

DELIMITER ;

INSERT INTO Producto (nombre, descripcion, precio, stockDisponible, estado)
VALUES
('Cepillo de bambu', 'Cepillo dental ecológico elaborado con mango de bambú biodegradable.', 8500.00, 35, 'Disponible'),
('Botella reutilizable', 'Botella reutilizable ideal para reducir el consumo de plástico de un solo uso.', 28000.00, 20, 'Disponible'),
('Bolsa de tela', 'Bolsa ecológica de tela resistente para compras y uso diario.', 12000.00, 50, 'Disponible'),
('Pitillos de acero', 'Set de pitillos reutilizables de acero inoxidable con cepillo limpiador.', 15000.00, 25, 'Disponible'),
('Jabon artesanal', 'Jabón artesanal elaborado con ingredientes naturales y empaques sostenibles.', 10000.00, 40, 'Disponible'),
('Shampoo solido', 'Shampoo sólido ecológico, libre de envases plásticos y práctico para uso diario.', 18000.00, 30, 'Disponible'),
('Acondicionador solido', 'Acondicionador sólido natural para el cuidado del cabello sin residuos plásticos.', 19000.00, 28, 'Disponible'),
('Desodorante natural', 'Desodorante natural en presentación ecológica, libre de químicos agresivos.', 16000.00, 22, 'Disponible'),
('Esponja vegetal', 'Esponja vegetal biodegradable para baño o limpieza del hogar.', 7000.00, 45, 'Disponible'),
('Detergente ecologico', 'Detergente ecológico biodegradable para el lavado de ropa.', 24000.00, 18, 'Disponible'),
('Limpiador multiusos', 'Limpiador multiusos ecológico para superficies del hogar.', 21000.00, 26, 'Disponible'),
('Cepillo para platos de bambu', 'Cepillo ecológico para lavar platos con mango de bambú.', 13000.00, 33, 'Disponible'),
('Panos reutilizables', 'Paños reutilizables para limpieza, ideales para reemplazar toallas desechables.', 14000.00, 38, 'Disponible'),
('Envoltorio de cera de abeja', 'Envoltorio reutilizable de cera de abeja para conservar alimentos.', 17000.00, 24, 'Disponible'),
('Contenedor de vidrio', 'Contenedor de vidrio reutilizable para almacenar alimentos.', 26000.00, 16, 'Disponible'),
('Maceta biodegradable', 'Maceta biodegradable para plantas, ideal para huertas caseras.', 9000.00, 30, 'Disponible'),
('Semillas para huerta', 'Paquete de semillas para iniciar una huerta casera sostenible.', 6000.00, 55, 'Disponible'),
('Compostera domestica', 'Compostera doméstica para convertir residuos orgánicos en abono natural.', 75000.00, 10, 'Disponible'),
('Cuaderno reciclado', 'Cuaderno elaborado con papel reciclado para uso académico o personal.', 11000.00, 42, 'Disponible'),
('Lapices reciclados', 'Set de lápices fabricados con materiales reciclados.', 8000.00, 48, 'Disponible');

SELECT * FROM Usuario;
SELECT * FROM Producto;
SELECT * FROM Carrito;
SELECT * FROM ItemCarrito;
SELECT * FROM Pago;
