# ProyectoIngSoftware2 - Ecomart

Este proyecto integra un frontend desarrollado con React + Vite y un backend con Node.js para la gestión de Ecomart.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado:
- Node.js (versión 14 o superior)
- MySQL Workbench
- Git

### Dependencias del proyecto

```bash
# Frontend
npm install react react-dom react-router-dom

# Backend
npm install express sequelize mysql2 dotenv cors bcryptjs

# Desarrollo y pruebas
npm install -D vite @vitejs/plugin-react eslint nodemon jest babel-jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @babel/preset-env @babel/preset-react

## Instalación y ejecución

### 📖 Instrucciones detalladas
Para ver el paso a paso completo de instalación y ejecución, consulta el [Instructivo de instalación](INSTRUCTIVO.md)

### Resumen rápido

```bash
# Clonar el repositorio
git clone -b union-peticiones --single-branch https://github.com/kharesban/ProyectoIngSoftware2.git

# Instalar dependencias
npm install

# Configurar variables de entorno (crear archivo .env)
# DB_HOST=localhost, DB_USER, DB_PASSWORD, DB_NAME=ecomart_db, PORT=3000

# Ejecutar el proyecto
npm start
