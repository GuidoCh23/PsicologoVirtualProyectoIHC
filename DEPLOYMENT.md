# Guía de Despliegue (Deployment)

Esta guía te ayudará a publicar tu aplicación en internet. Usaremos **Render** para el Backend (servidor y base de datos) y **Vercel** para el Frontend (página web).

## Parte 1: Backend en Render

1.  **Crear cuenta:** Ve a [render.com](https://render.com) y crea una cuenta (puedes usar GitHub).
2.  **Nueva Web Service:**
    -   Haz clic en "New +" y selecciona "Web Service".
    -   Conecta tu repositorio de GitHub.
3.  **Configuración:**
    -   **Name:** `psicologo-virtual-backend` (o el que gustes).
    -   **Root Directory:** `backend`
    -   **Environment:** `Node`
    -   **Build Command:** `npm install && npm run build`
    -   **Start Command:** `npm start`
4.  **Variables de Entorno (Environment Variables):**
    -   Haz clic en "Advanced" o ve a la pestaña "Environment".
    -   Añade las siguientes variables (copia los valores de tu `.env` local o crea nuevos):
        -   `DATABASE_URL`: (Ver paso siguiente para obtenerla de Render)
        -   `JWT_SECRET`: (Crea una contraseña segura)
        -   `GROQ_API_KEY`: (Tu llave de Groq)

### Base de Datos en Render (PostgreSQL)
1.  En el dashboard de Render, haz clic en "New +" y selecciona "PostgreSQL".
2.  Ponle un nombre (ej. `psicologo-db`).
3.  Copia la **Internal Database URL** y úsala como `DATABASE_URL` en las variables de entorno de tu Web Service.

## Parte 2: Frontend en Vercel

1.  **Crear cuenta:** Ve a [vercel.com](https://vercel.com) y crea una cuenta.
2.  **Nuevo Proyecto:**
    -   Haz clic en "Add New..." -> "Project".
    -   Importa tu repositorio de GitHub.
3.  **Configuración:**
    -   **Framework Preset:** Vite
    -   **Root Directory:** `frontend` (haz clic en "Edit" y selecciona la carpeta `frontend`).
4.  **Variables de Entorno:**
    -   Despliega la sección "Environment Variables".
    -   Añade:
        -   `VITE_API_URL`: Aquí pega la URL de tu backend en Render (ej. `https://psicologo-virtual-backend.onrender.com`). **IMPORTANTE:** No pongas la barra `/` al final.
5.  **Deploy:** Haz clic en "Deploy".

¡Listo! Vercel construirá tu sitio y te dará una URL (ej. `https://psicologo-virtual.vercel.app`) donde podrás ver tu aplicación funcionando.
