# EmoSense - Asistente de Voz Terapéutico

Tu asistente de inteligencia emocional con IA conversacional.

## 📁 Estructura del Proyecto

```
Asistente de Voz Terapéutico V2/
├── frontend/          # React + TypeScript + Vite
│   ├── src/          # Código fuente del frontend
│   ├── package.json  # Dependencias del frontend
│   └── vite.config.ts
├── backend/          # Node.js + Express + TypeScript + Prisma
│   ├── src/          # Código fuente del backend
│   ├── prisma/       # Esquemas y migraciones de Prisma
│   └── package.json  # Dependencias del backend
└── README.md         # Este archivo
```

## 🚀 Stack Tecnológico

### Frontend
- **React 18.3** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Web Speech API** - Voice Recognition & Synthesis

### Backend
- **Node.js + Express** - Server Framework
- **TypeScript** - Type Safety
- **Prisma** - ORM para PostgreSQL
- **Passport.js** - Autenticación OAuth
- **JWT** - Token-based Authentication

### Base de Datos
- **Supabase (PostgreSQL)** - Database + Auth

### APIs Externas
- **Groq API** - IA Conversacional (llama-3.3-70b-versatile)
- **Google OAuth** - Autenticación con Google

## 📦 Instalación

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase (para la base de datos)
- Google Cloud Project (para OAuth)

### Configuración

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd "Asistente de Voz Terapéutico V2"
```

2. **Instalar dependencias del frontend**
```bash
cd frontend
npm install
```

3. **Instalar dependencias del backend**
```bash
cd ../backend
npm install
```

4. **Configurar variables de entorno**

Backend `.env`:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GROQ_API_KEY="gsk_..."
PORT=5000
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000
```

5. **Configurar la base de datos**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## 🏃 Desarrollo

### Iniciar el backend
```bash
cd backend
npm run dev
```
El servidor estará disponible en `http://localhost:5000`

### Iniciar el frontend
```bash
cd frontend
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`

## 🚢 Deployment

### Frontend (Vercel)
1. Conecta tu repositorio con Vercel
2. Configura el directorio raíz como `frontend`
3. Agrega las variables de entorno necesarias
4. Deploy automático en cada push

### Backend (Render)
1. Crea un nuevo Web Service en Render
2. Conecta tu repositorio
3. Configura el directorio raíz como `backend`
4. Agrega las variables de entorno
5. Deploy automático en cada push

### Base de Datos (Supabase)
1. Crea un proyecto en Supabase
2. Copia la connection string de PostgreSQL
3. Actualiza `DATABASE_URL` en las variables de entorno del backend

## 📄 Licencia

Este proyecto es parte de un trabajo académico.

## 👥 Autor

Desarrollado como parte del curso de Interacción Humano-Computadora.
