# Cómo llevar PataHogar a otra PC

## 1. Qué copiar al pendrive

Copiá la carpeta `C:\xampp\htdocs\PataHogar` completa, **excepto**:

- `backend\node_modules` (pesa ~57 MB, se regenera solo)
- `frontend\node_modules` (pesa ~71 MB, se regenera solo)

Sin esas dos carpetas, todo el proyecto pesa ~1 MB. Dentro va incluido:

- `database\patahogar_backup.sql` → backup completo de tu base de datos (ya lo generé, incluye todas las tablas y los datos que tenés cargados)
- `backend\.env` y `frontend\.env` → configuración (claves, conexión a la base, etc.)
- `backend\uploads\` → las fotos que subiste
- Todo el código (`backend\src`, `frontend\src`, etc.)

**Importante:** el archivo `backend\.env` tiene contraseñas y claves secretas (JWT, Resend). Andá con cuidado con quién compartís ese pendrive.

## 2. Qué instalar en la PC nueva (antes de copiar nada)

1. **XAMPP** → instalalo igual que en esta PC. Solo vas a usar el módulo **MySQL** (arrancalo desde el Panel de Control de XAMPP, el botón "Start" de la fila MySQL). Apache no hace falta.
2. **Node.js** → bajalo de [nodejs.org](https://nodejs.org) (la versión LTS, cualquiera reciente sirve). Esto instala automáticamente `npm` también.
3. Abrí una terminal (PowerShell) y corré:
   ```
   npm install -g pm2
   ```

## 3. Copiar el proyecto

Pegá la carpeta `PataHogar` (sin los `node_modules`) dentro de `C:\xampp\htdocs\` en la PC nueva, quedando en:
`C:\xampp\htdocs\PataHogar`

## 4. Crear la base de datos

Con MySQL de XAMPP corriendo, abrí una terminal en `C:\xampp\mysql\bin` y creá el usuario de la app:

```
mysql -u root -e "CREATE USER 'patahogar_app'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA_ACA'; GRANT ALL PRIVILEGES ON patahogar.* TO 'patahogar_app'@'localhost'; FLUSH PRIVILEGES;"
```

Después importá el backup (esto crea la base `patahogar` con todas tus tablas y datos):

```
mysql -u root < "C:\xampp\htdocs\PataHogar\database\patahogar_backup.sql"
```

## 5. Instalar las dependencias del proyecto

Abrí una terminal en cada carpeta y corré `npm install`:

```
cd C:\xampp\htdocs\PataHogar\backend
npm install
```

```
cd C:\xampp\htdocs\PataHogar\frontend
npm install
```

## 6. Revisar el archivo `backend\.env`

Poné en `DB_PASSWORD` (dentro de `backend\.env`) la misma contraseña que usaste en el paso 4.

También revisá `CLIENT_URL` — si en esta PC lo dejaste apuntando a una IP de red (`192.168.0.11`), en la PC nueva esa IP no va a existir. Lo más simple es dejarlo así para arrancar:
```
CLIENT_URL=http://localhost:5173
```
Y lo mismo en `frontend\.env`:
```
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```
(si después querés volver a usarlo desde el celular en esa red nueva, avisame y lo configuramos como hicimos acá)

## 7. Levantar todo

**Backend:**
```
cd C:\xampp\htdocs\PataHogar\backend
pm2 start ecosystem.config.js
```

**Frontend** (en otra terminal):
```
cd C:\xampp\htdocs\PataHogar\frontend
npm run dev
```

## 8. Abrir la app

Andá al navegador y entrá a:
```
http://localhost:5173
```

Listo, debería funcionar igual que acá, con tus mismos usuarios y mascotas cargadas.
