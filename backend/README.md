# EmoSense Backend API

REST API para el asistente de voz terapéutico EmoSense.

## 🚀 Stack Tecnológico

- **Node.js** + **Express** - Framework del servidor
- **TypeScript** - Type safety
- **Prisma** - ORM para PostgreSQL
- **Passport.js** - Autenticación (Local + Google OAuth)
- **JWT** - Tokens de autenticación
- **bcrypt** - Hash de contraseñas
- **Groq API** - IA conversacional

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones de base de datos
npm run prisma:migrate
```

## 🏃 Desarrollo

```bash
# Modo desarrollo con hot reload
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start

# Abrir Prisma Studio (interfaz de BD)
npm run prisma:studio
```

## 🔑 Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/emosense"
PORT=5000
NODE_ENV=development

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GROQ_API_KEY=your-groq-api-key

FRONTEND_URL=http://localhost:3000
COOKIE_SECRET=your-cookie-secret
```

## 📚 Documentación de la API

### Base URL
```
http://localhost:5000/api
```

### Autenticación

Todas las rutas excepto `/auth/register`, `/auth/login` y `/auth/google` requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

---

### 🔐 Autenticación (`/api/auth`)

#### `POST /auth/register`
Registrar nuevo usuario con email/password.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "securePassword123",
  "apodo": "Juanito" // opcional
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "apodo": "Juanito",
    "fecha_registro": "2025-01-15T10:00:00.000Z",
    "preferencia_nombre": "nombre",
    "provider": "local"
  },
  "token": "jwt-token"
}
```

#### `POST /auth/login`
Iniciar sesión con email/password.

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": { /* ... */ },
  "token": "jwt-token"
}
```

#### `GET /auth/google`
Iniciar flujo de autenticación con Google OAuth.

#### `GET /auth/google/callback`
Callback de Google OAuth (redirige al frontend con token).

#### `GET /auth/me`
Obtener información del usuario actual.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  // ...
}
```

---

### 👤 Usuarios (`/api/users`)

#### `PUT /users/profile`
Actualizar perfil del usuario.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "apodo": "JP",
  "preferencia_nombre": "apodo",
  "nombre_asistente": "Luna"
}
```

**Response:**
```json
{
  "id": "uuid",
  "nombre": "Juan Pérez",
  "apodo": "JP",
  // ...
}
```

#### `GET /users/statistics`
Obtener estadísticas del usuario.

**Response:**
```json
{
  "totalSessions": 15,
  "totalTasks": 45,
  "completedTasks": 30,
  "totalPoints": 2250,
  "currentStreak": 7
}
```

#### `DELETE /users/account`
Eliminar cuenta del usuario (irreversible).

---

### 📝 Sesiones (`/api/sessions`)

#### `POST /sessions`
Crear nueva sesión terapéutica.

**Body:**
```json
{
  "momento_dia": "tarde",
  "duracion_minutos": 25,
  "emocion_predominante": "ansiedad",
  "intensidad_promedio": 7.5,
  "evolucion": "mejoro",
  "top_emociones": [
    { "emocion": "ansiedad", "porcentaje": 40 },
    { "emocion": "preocupación", "porcentaje": 30 },
    { "emocion": "calma", "porcentaje": 20 },
    { "emocion": "esperanza", "porcentaje": 10 }
  ],
  "ejercicios_realizados": ["Respiración 4-7-8"],
  "estado_emocional_final": "Más calmado",
  "calificacion_estrellas": 4,
  "conversacion": [
    { "role": "assistant", "text": "Hola, ¿cómo estás?" },
    { "role": "user", "text": "Algo ansioso..." }
  ],
  "tareas_asignadas": [
    {
      "titulo": "Respiración diaria",
      "descripcion": "Practicar 4-7-8 cada mañana",
      "frecuencia": "diaria",
      "puntos": 50
    }
  ]
}
```

**Response:**
```json
{
  "session": { /* sesión creada */ },
  "tasks": [ /* tareas creadas */ ]
}
```

#### `GET /sessions`
Obtener todas las sesiones del usuario.

**Response:**
```json
[
  {
    "id": "uuid",
    "fecha_hora": "2025-01-15T15:30:00.000Z",
    "momento_dia": "tarde",
    "duracion_minutos": 25,
    // ...
    "tasks": [ /* tareas asociadas */ ]
  }
]
```

#### `GET /sessions/:id`
Obtener sesión específica por ID.

#### `DELETE /sessions/:id`
Eliminar sesión y sus tareas asociadas.

#### `GET /sessions/stats`
Obtener estadísticas de sesiones.

**Response:**
```json
{
  "totalSessions": 15,
  "averageDuration": 23,
  "averageIntensity": 6.8,
  "averageRating": 4.2,
  "emotionDistribution": {
    "ansiedad": 5,
    "tristeza": 3,
    "calma": 7
  }
}
```

---

### ✅ Tareas (`/api/tasks`)

#### `POST /tasks`
Crear nueva tarea.

**Body:**
```json
{
  "sesion_origen": "session-uuid",
  "titulo": "Ejercicio de respiración",
  "descripcion": "Practicar 4-7-8 cada mañana",
  "frecuencia": "diaria",
  "puntos": 50,
  "fecha_vencimiento": "2025-01-22T00:00:00.000Z"
}
```

#### `GET /tasks`
Obtener todas las tareas del usuario.

**Query params:**
- `status`: `pending` | `completed` (opcional)

**Response:**
```json
[
  {
    "id": "uuid",
    "titulo": "Ejercicio de respiración",
    "descripcion": "Practicar 4-7-8 cada mañana",
    "frecuencia": "diaria",
    "puntos": 50,
    "estado": "pendiente",
    "fecha_asignada": "2025-01-15T10:00:00.000Z",
    "fecha_vencimiento": "2025-01-22T00:00:00.000Z",
    "fecha_completada": null,
    "session": { /* sesión origen */ }
  }
]
```

#### `GET /tasks/:id`
Obtener tarea específica por ID.

#### `PATCH /tasks/:id/complete`
Marcar tarea como completada.

**Response:**
```json
{
  "id": "uuid",
  "estado": "completada",
  "fecha_completada": "2025-01-16T08:30:00.000Z",
  // ...
}
```

#### `DELETE /tasks/:id`
Eliminar tarea.

#### `GET /tasks/pending/count`
Obtener cantidad de tareas pendientes.

**Response:**
```json
{
  "count": 5
}
```

---

### 🤖 IA (`/api/ai`)

#### `POST /api/message`
Enviar mensaje a la IA y obtener respuesta.

**Body:**
```json
{
  "message": "Me siento ansioso hoy",
  "conversationHistory": [
    {
      "role": "system",
      "content": "Eres un asistente terapéutico..."
    },
    {
      "role": "user",
      "content": "Hola"
    },
    {
      "role": "assistant",
      "content": "¡Hola! ¿Cómo estás hoy?"
    }
  ]
}
```

**Response:**
```json
{
  "response": "Entiendo que te sientes ansioso. ¿Podrías contarme más sobre qué está causando esa ansiedad?"
}
```

---

### 🏥 Health Check

#### `GET /api/health`
Verificar estado del servidor.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

---

## 📊 Modelos de Base de Datos

### User
- `id`: UUID
- `nombre`: String
- `email`: String (unique)
- `password`: String (nullable para OAuth)
- `apodo`: String (opcional)
- `fecha_registro`: DateTime
- `foto_perfil`: String (URL, opcional)
- `preferencia_nombre`: Enum ('nombre', 'apodo', 'ninguno')
- `nombre_asistente`: String (opcional)
- `googleId`: String (unique, nullable)
- `provider`: String ('local' | 'google')

### Session
- `id`: UUID
- `userId`: FK -> User
- `fecha_hora`: DateTime
- `momento_dia`: Enum ('mañana', 'tarde', 'noche')
- `duracion_minutos`: Int
- `emocion_predominante`: String
- `intensidad_promedio`: Float
- `evolucion`: Enum ('mejoró', 'empeoró', 'se_mantuvo')
- `top_emociones`: JSON
- `ejercicios_realizados`: String[]
- `estado_emocional_final`: String
- `calificacion_estrellas`: Int
- `conversacion`: JSON

### Task
- `id`: UUID
- `userId`: FK -> User
- `sesion_origen`: FK -> Session
- `fecha_asignada`: DateTime
- `fecha_vencimiento`: DateTime
- `titulo`: String
- `descripcion`: String
- `frecuencia`: String
- `puntos`: Int
- `estado`: Enum ('pendiente', 'completada')
- `fecha_completada`: DateTime (nullable)

---

## 🔒 Seguridad

- **Passwords**: Hasheadas con bcrypt (10 rounds)
- **JWT**: Tokens firmados con secret, expiración configurable
- **CORS**: Configurado para aceptar solo el frontend especificado
- **OAuth**: Google OAuth 2.0 con Passport.js
- **Validación**: Validación de inputs en todos los endpoints

## 🚢 Deployment

### Render

1. Crear nuevo Web Service en Render
2. Conectar repositorio
3. Configurar:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `backend`
4. Agregar variables de entorno desde `.env.example`
5. Conectar base de datos PostgreSQL (Render ofrece una gratuita)

### Variables de Entorno en Producción

Asegúrate de actualizar:
- `DATABASE_URL`: Connection string de tu base de datos en producción
- `FRONTEND_URL`: URL de tu frontend en Vercel
- `GOOGLE_CALLBACK_URL`: URL del callback en producción
- `JWT_SECRET`: Genera uno nuevo y seguro
- `COOKIE_SECRET`: Genera uno nuevo y seguro
- `NODE_ENV`: `production`

---

## 📝 Licencia

Este proyecto es parte de un trabajo académico.
