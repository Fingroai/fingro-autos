# Fingro Autos 🚗

Plataforma de financiamiento vehicular 100% digital que conecta usuarios buscando créditos de auto con bancos y financieras.

## Características Principales

- **Solicitudes de crédito digitales**: Proceso 100% online desde la aplicación hasta la firma
- **Marketplace de ofertas**: Múltiples bancos pueden enviar ofertas competitivas al usuario
- **Panel de usuario**: Seguimiento del estado de solicitudes y ofertas
- **Dashboard para bancos**: Análisis de solicitudes y gestión de ofertas
- **Founder Cockpit**: Panel administrativo para métricas y operaciones

## Tecnologías

- **Frontend**: Next.js 15 con App Router
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```
# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role

# App URL (para auth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (opcional)
RESEND_API_KEY=tu-api-key
```

## Estructura del Proyecto

- `/src/app` - Rutas y componentes (Next.js App Router)
- `/src/app/api` - API endpoints
- `/src/app/banco` - Panel para bancos 
- `/src/app/control` - Dashboard administrativo (Founder Cockpit)
- `/src/app/panel` - Panel de usuario
- `/lib` - Utilidades y configuración Supabase

## Deploy

### Vercel
Recomendado para despliegue rápido y sencillo:
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy

### Self-hosted
```bash
npm run build
npm start
```
