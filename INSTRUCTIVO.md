# Nota importante: Antes de comenzar, debes tener instalado en tu computadora:
- Node.js
- MySQL Workbench
- Git

# Pasos para la visualización del proyecto:

### Parte A (Manejo en editor de código):

1. Clonar el repositorio con la Branch especifica

        git clone -b union-peticiones --single-branch https://github.com/kharesban/ProyectoIngSoftware2.git

2. Instalar el node_modules

        npm install

3. Configurar variables de entorno:

   Crea un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido:

        DB_HOST=localhost
        DB_USER=tu_usuario
        DB_PASSWORD=tu_contraseña
        DB_NAME=ecomart_db
        PORT=3000

### Parte B (Manejo en MySQL):

1. Abrir MySQL Workbench y conectarse a su servidor local
2. Abrir el archivo EcomartScript.sql (ubicado en el repositorio)
3. Ejecutar el script completo (Execute)
4. Verificar que la base de datos "ecomart_db" se haya creado correctamente

### Parte C (Ejecutar el proyecto):

1. En la terminal, ejecutar para hacer uso del backEnd:

        npm run start 

2. En la terminal, ejecutar ejecutar para hacer uso del FrontEnd:

        npm run dev 

2. Abrir http://localhost:3000 en el navegador
