# Backend - Psicólogo Virtual

Este directorio contiene la API del servidor (Backend) construida con **Node.js**, **Express** y **Prisma**.

## Tecnologías Utilizadas

-   **Node.js**: Entorno de ejecución de JavaScript.
-   **Express**: Framework web para Node.js.
-   **TypeScript**: Lenguaje de programación.
-   **Prisma ORM**: Mapeo objeto-relacional para la base de datos.
-   **PostgreSQL**: Base de datos relacional.
-   **Docker**: Contenedorización para la base de datos.
-   **Groq SDK**: Integración con modelos de IA (Llama 3).

## Requisitos Previos

-   Node.js (v18 o superior)
-   Docker y Docker Compose (para la base de datos)

## Configuración

1.  Navega al directorio `backend`:
    ```bash
    cd backend
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Configura las variables de entorno:
    Crea un archivo `.env` en la raíz de `backend/` con el siguiente contenido (ajusta según tus credenciales):

    ```env
    PORT=3000
    DATABASE_URL="postgresql://postgres:password@localhost:5432/psicologo_db?schema=public"
    JWT_SECRET="tu_secreto_super_seguro"
    GROQ_API_KEY="gsk_..." # Tu API Key de Groq
    ```

## Base de Datos

1.  Inicia el contenedor de PostgreSQL con Docker:
    ```bash
    docker-compose up -d
    ```

2.  Sincroniza el esquema de Prisma con la base de datos:
    ```bash
    npx prisma db push
    ```

## Ejecución

### Modo Desarrollo
Para iniciar el servidor con recarga automática (nodemon):

```bash
npm run dev
```
El servidor correrá en `http://localhost:3000`.

### Modo Producción
Para compilar y ejecutar la versión optimizada:

```bash
npm run build
npm start
```

## Endpoints Principales

-   `POST /api/auth/register`: Registro de usuarios.
-   `POST /api/auth/login`: Inicio de sesión.
-   `GET /api/sessions`: Obtener historial de sesiones.
-   `POST /api/sessions`: Guardar una nueva sesión.
-   `GET /api/tasks`: Obtener tareas asignadas.
-   `POST /api/ai/chat`: Interactuar con el asistente de IA.
