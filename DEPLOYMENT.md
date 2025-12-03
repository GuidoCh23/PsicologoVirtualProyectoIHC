# 🚀 Guía de Deployment - EmoSense

Guía paso a paso para deployar la aplicación en **Vercel** (frontend) y **Render** (backend) con **PostgreSQL**.

---

## 📋 Resumen de Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Render        │────▶│  PostgreSQL     │
│   (Frontend)    │     │   (Backend)     │     │  (Render DB)    │
│   React + Vite  │     │   Node + Express│     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 🗄️ PASO 1: Configurar Base de Datos PostgreSQL

### Opción A: Render PostgreSQL (Recomendado para Free Tier)

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"PostgreSQL"**
3. Configura:
   - **Name**: `emosense-db`
   - **Database**: `emosense`
   - **User**: (se genera automáticamente)
   - **Region**: Oregon (o el más cercano)
   - **Plan**: Free
4. Click en **"Create Database"**
5. **Guarda** la **Internal Database URL** (la usaremos en el backend)

### Opción B: Supabase (Alternativa con más features)

1. Ve a [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia la **Connection String** desde Settings → Database
4. Formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

---

## 🔧 PASO 2: Deployar Backend en Render

### 2.1. Preparar el Repositorio

1. Asegúrate de que tu código esté en GitHub
2. Haz commit de todos los cambios:
```bash
git add .
git commit -m "Preparar para deployment en Render"
git push origin main
```

### 2.2. Crear Web Service en Render

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura:

#### Build Settings:
- **Name**: `emosense-backend`
- **Region**: Oregon
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**:
  ```bash
  npm install && npx prisma generate && npm run build
  ```
- **Start Command**:
  ```bash
  npx prisma migrate deploy && npm start
  ```

#### Environment Variables (Variables de Entorno):

Agrega las siguientes variables en Render:

| Key | Value | Notas |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `5000` | |
| `DATABASE_URL` | *[Tu PostgreSQL URL]* | Copia de Render PostgreSQL o Supabase |
| `JWT_SECRET` | *[Genera uno seguro]* | Usar generador: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | `7d` | |
| `GROQ_API_KEY` | `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` | Tu API key actual |
| `FRONTEND_URL` | *[URL de Vercel]* | Actualizar después del deploy frontend |
| `COOKIE_SECRET` | *[Genera uno seguro]* | Usar generador: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | *(opcional)* | Solo si usas OAuth |
| `GOOGLE_CLIENT_SECRET` | *(opcional)* | Solo si usas OAuth |
| `GOOGLE_CALLBACK_URL` | `https://tu-backend.onrender.com/api/auth/google/callback` | Solo si usas OAuth |

5. Click en **"Create Web Service"**
6. Espera a que termine el deploy (puede tomar 5-10 minutos)
7. **Guarda tu URL de backend**: `https://tu-backend.onrender.com`

### 2.3. Verificar Backend

Una vez deployado, verifica:
```bash
curl https://tu-backend.onrender.com/api/health
```

Deberías ver: `{"status":"ok","timestamp":"..."}`

---

## 🌐 PASO 3: Deployar Frontend en Vercel

### 3.1. Actualizar Variable de Entorno

1. En tu archivo `frontend/.env`, actualiza:
```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

2. Haz commit:
```bash
git add frontend/.env
git commit -m "Actualizar URL del backend para producción"
git push origin main
```

### 3.2. Deploy en Vercel

#### Opción A: Desde la Web

1. Ve a [Vercel](https://vercel.com)
2. Click en **"Add New..."** → **"Project"**
3. Importa tu repositorio de GitHub
4. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. En **Environment Variables**, agrega:
   - Key: `VITE_API_URL`
   - Value: `https://tu-backend.onrender.com/api`

6. Click en **"Deploy"**

#### Opción B: Desde CLI

```bash
cd frontend
npx vercel

# Sigue las instrucciones:
# - Set up and deploy: Yes
# - Which scope: Tu cuenta
# - Link to existing project: No
# - Project name: emosense-frontend
# - Directory: ./
# - Override settings: No
```

### 3.3. Guardar URL del Frontend

Después del deploy, Vercel te dará una URL como:
`https://tu-app.vercel.app`

---

## 🔄 PASO 4: Actualizar CORS y URLs

### 4.1. Actualizar Backend

Vuelve a Render y actualiza la variable de entorno:
- `FRONTEND_URL` = `https://tu-app.vercel.app`

Render automáticamente redesplegará el backend.

### 4.2. Verificar CORS

El backend ya está configurado para aceptar requests del frontend especificado en `FRONTEND_URL`.

---

## ✅ PASO 5: Verificación Final

### Checklist de Verificación:

- [ ] Backend responde en `https://tu-backend.onrender.com/api/health`
- [ ] Frontend carga en `https://tu-app.vercel.app`
- [ ] Puedes registrar un nuevo usuario
- [ ] Puedes iniciar sesión
- [ ] Puedes crear una sesión terapéutica
- [ ] Las tareas se guardan correctamente
- [ ] El historial muestra las sesiones

---

## 🔒 PASO 6: Seguridad (Opcional pero Recomendado)

### 6.1. Configurar Dominio Personalizado

**En Vercel:**
1. Settings → Domains
2. Agrega tu dominio (ej: `emosense.com`)

**En Render:**
1. Settings → Custom Domain
2. Agrega tu dominio (ej: `api.emosense.com`)

### 6.2. Configurar Google OAuth (Opcional)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega las URLs autorizadas:
   - Authorized JavaScript origins: `https://tu-app.vercel.app`
   - Authorized redirect URIs: `https://tu-backend.onrender.com/api/auth/google/callback`
6. Copia Client ID y Client Secret
7. Actualiza las variables de entorno en Render

---

## 📊 PASO 7: Monitoreo

### Render Logs
```bash
# Ver logs en tiempo real
https://dashboard.render.com/web/YOUR-SERVICE-ID/logs
```

### Vercel Logs
```bash
# Ver logs de deployment
https://vercel.com/YOUR-PROJECT/deployments
```

---

## 🐛 Troubleshooting

### Error: "Can't reach database"
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que las migraciones se ejecutaron: `npx prisma migrate deploy`

### Error: "CORS policy"
- Verifica que `FRONTEND_URL` esté correctamente configurada en el backend
- Asegúrate de incluir el protocolo `https://`

### Error: "API key not configured"
- Verifica que `GROQ_API_KEY` esté configurada en Render

### Frontend no se conecta al backend
- Verifica que `VITE_API_URL` esté correctamente configurada
- Recuerda: Las variables `VITE_*` se compilan en build time, no runtime

---

## 🔄 Actualizar Deployment

### Actualizar Backend:
```bash
git add backend/
git commit -m "Actualizar backend"
git push origin main
# Render auto-redeploys
```

### Actualizar Frontend:
```bash
git add frontend/
git commit -m "Actualizar frontend"
git push origin main
# Vercel auto-redeploys
```

---

## 💰 Costos

### Free Tier Limits:

**Render (Backend + Database):**
- PostgreSQL: 1 GB storage
- Web Service: 750 horas/mes
- ⚠️ El servicio duerme después de 15 min de inactividad

**Vercel (Frontend):**
- 100 GB bandwidth/mes
- Unlimited deployments
- Auto SSL

---

## 📝 Notas Importantes

1. **Primer deploy**: El backend puede tardar 5-10 minutos en el primer deploy
2. **Cold starts**: En el free tier, el backend se duerme después de 15 min sin uso
3. **Migraciones**: Siempre se ejecutan automáticamente en cada deploy
4. **Variables de entorno**: Cambios requieren redeploy manual

---

## 🎉 ¡Listo!

Tu aplicación EmoSense ahora está en producción:
- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://tu-backend.onrender.com`
- **Database**: PostgreSQL en Render

¡Felicitaciones! 🚀
