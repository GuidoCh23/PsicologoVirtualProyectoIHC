# Proyecto Psicólogo Virtual - IHC

Este proyecto es una aplicación web Full Stack diseñada para ofrecer apoyo emocional y psicológico a través de un asistente virtual impulsado por Inteligencia Artificial.

## Descripción General

La aplicación permite a los usuarios interactuar con un "Psicólogo Virtual" que puede mantener conversaciones, analizar el estado emocional del usuario, realizar seguimiento de su progreso y asignar tareas terapéuticas personalizadas.

### Características Principales

-   **Chat con IA**: Conversaciones naturales y empáticas utilizando modelos avanzados (Llama 3 via Groq).
-   **Análisis Emocional**: Detección automática de emociones predominantes en cada sesión.
-   **Historial de Sesiones**: Registro detallado de conversaciones pasadas y evolución emocional.
-   **Sistema de Tareas**: Asignación y seguimiento de actividades para mejorar el bienestar (gamificado con puntos).
-   **Dashboard**: Vista general del progreso, rachas y estadísticas del usuario.
-   **Soporte Multilingüe**: Interfaz disponible en Español e Inglés.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

-   **`/frontend`**: La interfaz de usuario construida con React, Vite y Tailwind CSS.
-   **`/backend`**: La API y lógica del servidor construida con Node.js, Express, Prisma y PostgreSQL.

## Cómo Empezar

Para ejecutar el proyecto completo, necesitarás levantar tanto el frontend como el backend.

1.  **Backend**: Sigue las instrucciones en [backend/README.md](./backend/README.md) para configurar la base de datos y arrancar el servidor API.
2.  **Frontend**: Sigue las instrucciones en [frontend/README.md](./frontend/README.md) para iniciar la interfaz web.

Una vez ambos servicios estén corriendo, abre tu navegador en `http://localhost:5173` (o el puerto que indique Vite) para usar la aplicación.
