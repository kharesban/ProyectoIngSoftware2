# ProyectoIngSoftware2 - Ecomart

Este proyecto integra un frontend desarrollado con React + Vite y un backend con Node.js para la gestión de Ecomart.

```markdown
# Requisitos previos

Para que el proyecto funcione correctamente en local, cada desarrollador debe tener instalado:

- Node.js
- npm
- MySQL
- Docker Desktop
- Git

# Instalación

Después de clonar el repositorio, ejecuta los siguientes comandos desde la carpeta principal del proyecto:

npm install
```

Si el backend tiene su propio `package.json`, instala también sus dependencias:

```bash
cd Backend
npm install
cd ..
```

# Dependencias principales

```bash
npm install express cors dotenv sequelize mysql2
```

# Pruebas unitarias y cobertura

```bash
npm install -D jest babel-jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event supertest
```

# Pruebas E2E con Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

# SonarQube

Instala la dependencia:

```bash
npm install -D @sonar/scan
```

Levanta SonarQube con Docker:

```bash
docker-compose up -d
```

Accede a SonarQube en:

```
http://localhost:9000
```

# Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm test` | Ejecuta pruebas unitarias y genera cobertura |
| `npm run test:e2e` | Ejecuta pruebas end-to-end |
| `npm run sonar` | Envía el análisis a SonarQube |

# Configuración del entorno

Crea/configura el archivo `.env` dentro de la carpeta del backend con los datos de conexión a MySQL. Esto es necesario para el correcto funcionamiento del login, productos, carrito y pagos.

