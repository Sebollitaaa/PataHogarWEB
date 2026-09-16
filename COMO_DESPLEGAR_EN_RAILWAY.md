# Cómo desplegar PataHogar en Railway

El código ya está preparado (commit `1fde356`). Lo que sigue son pasos que tenés que hacer vos en el navegador, porque necesitan tu cuenta.

## 1. Crear la cuenta y el proyecto

1. Andá a [railway.app](https://railway.app) → **Login** → entrá con tu cuenta de GitHub (`Sebollitaaa`).
2. **New Project** → **Deploy from GitHub repo** → elegí `Sebollitaaa/PataHogarWEB`.
3. Railway va a crear un primer servicio automáticamente. Dejalo — es el backend+frontend juntos (el que sirve todo desde un solo proceso, como armamos).

## 2. Agregar la base de datos MySQL

1. Dentro del proyecto, botón **+ New** → **Database** → **Add MySQL**.
2. Se crea un servicio nuevo llamado `MySQL`. Hacé clic en él → pestaña **Variables** → ahí vas a ver `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` (los nombres exactos pueden variar un poco, fijate cómo aparecen en tu panel).

## 3. Configurar las variables de entorno del backend

Hacé clic en el servicio del backend (no el de MySQL) → pestaña **Variables** → **Raw editor** (o cargalas una por una) y pegá esto, **completando lo que falta**:

```
NODE_ENV=production

DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

JWT_ACCESS_SECRET=<generá uno nuevo, ver abajo>
JWT_REFRESH_SECRET=<generá otro distinto, ver abajo>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN_DAYS_REMEMBER=30
JWT_REFRESH_EXPIRES_IN_DAYS_SESSION=1

LOCATION_MISMATCH_BLOCK_KM=100

CLIENT_URL=https://<tu-dominio-de-railway>.up.railway.app
```

**Las líneas `${{MySQL.MYSQLHOST}}` etc. son "referencias"**: le dicen a Railway "usá el valor de esa variable del servicio MySQL". Se escriben tal cual, Railway las resuelve solo — no reemplaces eso por un valor a mano.

**Para generar `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`** (tienen que ser dos valores random distintos, largos): corré esto dos veces en tu PC y pegá cada resultado en su variable:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**`CLIENT_URL`**: no vas a saber el dominio hasta el primer deploy. Dejalo con cualquier valor por ahora, hacé el primer deploy, copiá la URL que te da Railway (paso 5), volvé acá y actualizala.

> No hay verificación por email: las cuentas quedan activas apenas se registran, para poder probar con las cuentas que quieras.

## 4. Agregar un volumen para las fotos

Sin esto, cada vez que se actualice el código se van a borrar todas las fotos subidas.

1. En el servicio del backend → pestaña **Settings** → sección **Volumes** → **+ New Volume**.
2. **Mount path**: `/app/backend/uploads`
3. Guardá.

## 5. Configurar el build y hacer el primer deploy

1. En el servicio del backend → **Settings** → confirmá que:
   - **Root Directory** esté vacío (usa la raíz del repo).
   - **Build Command**: `npm run build` (ya viene definido en `railway.json`, no debería hacer falta tocarlo).
   - **Start Command**: `npm start` (también ya está en `railway.json`).
2. Andá a la pestaña **Deployments** y esperá a que termine (mirá los logs — tarda unos minutos la primera vez, instala todo y compila el frontend).
3. Cuando termine, andá a **Settings** → **Networking** → **Generate Domain**. Te da una URL tipo `patahogar-production.up.railway.app`.
4. Volvé a **Variables** y pegá esa URL completa (con `https://`) en `CLIENT_URL`. Guardá — esto redespliega solo.

## 6. Correr las migraciones (crear las tablas)

Esto se hace una sola vez, desde tu PC, usando la terminal de Railway:

```bash
npm install -g @railway/cli
railway login
```
(se abre el navegador para que confirmes)

```bash
cd C:\xampp\htdocs\PataHogar
railway link
```
(te va a preguntar el proyecto — elegí `PataHogarWEB` y el servicio del backend)

```bash
cd backend
railway run npm run migrate
railway run npm run seed
```

Esto crea las tablas en el MySQL de Railway y carga las ciudades/especies iniciales — igual que hicimos en tu PC al principio.

## 7. Probarla

Entrá a la URL que generaste en el paso 5. Registrate, publicá una mascota, probá el chat. Si algo no anda, mirá los logs en la pestaña **Deployments** → click en el deploy activo → **View Logs**.

---

## Qué cambió en el código para que esto funcione

- El backend ahora sirve el frontend compilado desde el mismo proceso (un solo servicio, sin CORS que configurar entre dos sitios).
- El frontend usa rutas relativas (`/api`) y se conecta al socket del mismo origen cuando no hay una URL distinta configurada — no hace falta tocar nada de eso para Railway.
- `package.json` en la raíz + `railway.json` le dicen a Railway cómo compilar (`npm run build`: instala y compila el frontend, instala el backend) y cómo arrancar (`npm start`).

## Costos aproximados

Railway te da $5 gratis para probar. Después, con esta app (un servicio chico + una base MySQL chica) el uso real ronda los **$5-10 USD/mes**, dependiendo de cuánto tráfico tenga. Podés poner un límite de gasto en **Settings del proyecto → Usage Limit** para no llevarte sorpresas.
