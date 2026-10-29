/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_PARROQUIA_NOMBRE?: string
  readonly VITE_PARROQUIA_DIOCESIS?: string
  readonly VITE_PARROQUIA_DIRECCION?: string
  readonly VITE_PARROQUIA_TELEFONO?: string
  readonly VITE_RATE_LIMIT_INTENTOS?: string
  readonly VITE_RATE_LIMIT_MINUTOS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
