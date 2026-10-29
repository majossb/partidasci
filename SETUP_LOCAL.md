# Guía de Puesta en Marcha en Local (Entorno Universitario)

Esta guía contiene los pasos exactos para conectar y levantar la copia local del sistema de libros sacramentales contra un **nuevo proyecto de Supabase** completamente vacío, sin afectar el proyecto de producción original.

---

## 1. Prerrequisitos

- **Node.js**: v18 o superior (`node -v`)
- **Gestor de paquetes**: npm (`npm -v`)
- **Supabase CLI**: Instalable globalmente o ejecutable mediante `npx supabase`
- **Proyecto nuevo en Supabase**: Creado previamente desde [supabase.com](https://supabase.com), completamente vacío.

---

## 2. Variables de Entorno (`.env.local`)

En la raíz del proyecto (`parroquia-santa-clara/`), edita el archivo `.env.local` con las credenciales de tu **nuevo proyecto**:

```env
# Conexión a tu nuevo proyecto de Supabase
VITE_SUPABASE_URL=https://<TU-NUEVO-PROJECT-REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<TU_NUEVO_ANON_KEY>

# Seguridad y limitación de intentos de inicio de sesión
VITE_RATE_LIMIT_INTENTOS=5
VITE_RATE_LIMIT_MINUTOS=15

# Configuración institucional (valores estándar para entorno de pruebas)
VITE_PARROQUIA_NOMBRE=Parroquia de Prueba
VITE_PARROQUIA_DIOCESIS=Diócesis de Prueba
VITE_PARROQUIA_DIRECCION=Calle 1 # 2 - 3
VITE_PARROQUIA_TELEFONO=6000000000
```

> **IMPORTANTE**: No incluyas `service_role_key` en `.env.local` ni en el frontend.

---

## 3. Conexión y Migraciones con Supabase CLI

Abre una terminal en la carpeta `parroquia-santa-clara/` y ejecuta los siguientes comandos en orden:

### Paso 3.1: Iniciar sesión en Supabase CLI
```bash
npx supabase login
```
*(Se abrirá el navegador para autorizar la CLI con tu cuenta de Supabase).*

### Paso 3.2: Vincular el CLI al proyecto NUEVO
> **ATENCIÓN**: Verifica minuciosamente que `<TU-NUEVO-PROJECT-REF>` corresponda al proyecto nuevo y vacío, **NUNCA** al de producción.
```bash
npx supabase link --project-ref <TU-NUEVO-PROJECT-REF>
```

### Paso 3.3: Verificación de seguridad del proyecto vinculado
Antes de ejecutar cualquier cambio en la base de datos, confirma que el CLI guardó exactamente el Project Ref del proyecto nuevo:

**En Windows (PowerShell):**
```powershell
Get-Content supabase/.temp/project-ref
```

**En Linux / macOS:**
```bash
cat supabase/.temp/project-ref
```

*Asegúrate de que la cadena mostrada coincida con tu nuevo proyecto.*

### Paso 3.4: Simulación previa (`dry-run`)
Ejecuta una verificación sin aplicar cambios para comprobar la conexión y ver las 30 migraciones que están pendientes por aplicar:
```bash
npx supabase db push --dry-run
```

### Paso 3.5: Aplicar las 30 migraciones del esquema
Una vez verificado que es el proyecto nuevo y que el dry-run no reportó inconsistencias, aplica las migraciones:
```bash
npx supabase db push
```

---

## 4. Configuración de Supabase Auth y Usuarios

Debes configurar la autenticación y crear los usuarios **antes** de cargar el seed, para que los roles y permisos queden listos.

### 4.1 URLs de Redirección
1. En tu panel de Supabase ve a **Authentication** -> **URL Configuration**.
2. Configura:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: Añade `http://localhost:5173/**`
3. Guarda los cambios.

### 4.2 Configuración del Proveedor Email
1. Ve a **Authentication** -> **Providers** -> **Email**.
2. Para desarrollo local se recomienda desactivar **Confirm email** (permite ingresar de inmediato sin esperar confirmación por correo).

### 4.3 Creación de Usuarios de Prueba
1. Ve a **Authentication** -> **Users** y haz clic en **Add User** -> **Create User**.
2. Asegúrate de marcar la casilla **Auto Confirm User?** en `ON`.
3. Crea las dos cuentas requeridas:
   - **Usuario Párroco**: `padre@parroquia.com`
   - **Usuario Secretaria**: `secretaria@parroquia.com`

> **Recomendación de Seguridad**: Aunque sean usuarios de prueba para un entorno local/universitario, asigna contraseñas fuertes (mínimo 12 caracteres combinando mayúsculas, minúsculas, números y símbolos, ej. `Prueba2024*Local!Segura`) para cumplir con las mejores prácticas y los validadores de seguridad del formulario de login.

### 4.4 Asignación Canónica de Roles en `raw_app_meta_data`
El sistema utiliza el claim `role` en `raw_app_meta_data` para el control de acceso canónico (políticas RLS y control de vistas en el frontend).

Ve al **SQL Editor** de tu panel de Supabase y ejecuta:

```sql
-- Asignar rol de Párroco
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "padre"}'::jsonb
WHERE email = 'padre@parroquia.com';

-- Asignar rol de Secretaria
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "secretaria"}'::jsonb
WHERE email = 'secretaria@parroquia.com';
```

---

## 5. Carga de Datos Ficticios (Seed)

Una vez que el esquema y los usuarios existen con sus roles asignados, puebla la base de datos con registros 100% ficticios:

1. Entra a tu dashboard de Supabase -> **SQL Editor**.
2. Abre o copia el contenido completo del archivo [`supabase/seed/datos_ficticios.sql`](file:///c:/Users/Maria%20Jose/OneDrive/Desktop/Sistema%20de%20partidas/parroquia-santa-clara/supabase/seed/datos_ficticios.sql).
3. Haz clic en **Run**.

*Este script insertará la configuración inicial del sistema y partidas de muestra inventadas para Bautismo, Confirmación, Matrimonio y Defunción.*

---

## 6. Despliegue de Edge Functions (OCR)

El sistema cuenta con la función `ocr-sacramento` que utiliza Google Gemini para digitalizar actas:

1. Configura la API Key de Gemini en tu nuevo proyecto de Supabase:
```bash
npx supabase secrets set GEMINI_API_KEY=<TU_GEMINI_API_KEY>
```

2. Despliega la función:
```bash
npx supabase functions deploy ocr-sacramento
```

---

## 7. Storage (Almacenamiento de Firmas)

Las migraciones `012_bucket_firmas.sql`, `025_bucket_firmas_privado.sql` y `029_fix_firmas_storage_rls.sql` configuran de forma declarativa el bucket privado `firmas` en Supabase Storage con sus políticas de acceso RLS durante el paso `db push`. No requiere configuración manual adicional.

---

## 8. Instalación y Arranque del Frontend

1. Instala las dependencias del proyecto:
```bash
npm install
```

2. Inicia el servidor de desarrollo local:
```bash
npm run dev
```

3. Abre en tu navegador:
```
http://localhost:5173
```

Inicia sesión con `padre@parroquia.com` o `secretaria@parroquia.com` y la contraseña fuerte que definiste en el paso 4.3.
