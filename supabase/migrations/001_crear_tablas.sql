-- 001_crear_tablas.sql

-- Crear ENUMs
CREATE TYPE estado_partida AS ENUM ('activo', 'requiere_revision');
CREATE TYPE tipo_operacion AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- 1. Tabla: sacramentos_bautismo
CREATE TABLE public.sacramentos_bautismo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio INTEGER NOT NULL,
    numero INTEGER NOT NULL,
    parroquia TEXT NOT NULL DEFAULT 'Parroquia de Prueba',
    fecha_bautismo DATE NOT NULL,
    ministro TEXT NOT NULL,
    nombre_bautizado TEXT NOT NULL,
    apellidos_bautizado TEXT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    lugar_nacimiento TEXT NOT NULL,
    nombre_padre TEXT,
    nombre_madre TEXT,
    abuelos_paternos TEXT,
    abuelos_maternos TEXT,
    padrino TEXT,
    madrina TEXT,
    da_fe TEXT,
    anotaciones TEXT,
    estado estado_partida DEFAULT 'activo',
    creado_por UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_por UUID REFERENCES auth.users(id),
    actualizado_en TIMESTAMPTZ,
    UNIQUE(folio, numero)
);

-- 2. Tabla: sacramentos_confirmacion
CREATE TABLE public.sacramentos_confirmacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio INTEGER NOT NULL,
    numero INTEGER NOT NULL,
    parroquia TEXT NOT NULL DEFAULT 'Parroquia de Prueba',
    fecha_confirmacion DATE NOT NULL,
    ministro TEXT NOT NULL,
    nombre_confirmado TEXT NOT NULL,
    apellidos_confirmado TEXT NOT NULL,
    lugar_confirmacion TEXT NOT NULL,
    nombre_padre TEXT,
    nombre_madre TEXT,
    padrino_madrina TEXT,
    parroquia_bautismo TEXT,
    diocesis TEXT,
    dia_semana TEXT,
    numero_libro_bautismo TEXT,
    anotaciones TEXT,
    estado estado_partida DEFAULT 'activo',
    creado_por UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_por UUID REFERENCES auth.users(id),
    actualizado_en TIMESTAMPTZ,
    UNIQUE(folio, numero)
);

-- 3. Tabla: sacramentos_matrimonio
CREATE TABLE public.sacramentos_matrimonio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio INTEGER NOT NULL,
    numero INTEGER NOT NULL,
    parroquia TEXT NOT NULL DEFAULT 'Parroquia de Prueba',
    fecha_matrimonio DATE NOT NULL,
    nombre_esposo TEXT NOT NULL,
    apellidos_esposo TEXT NOT NULL,
    nombre_esposa TEXT NOT NULL,
    apellidos_esposa TEXT NOT NULL,
    padre_esposo TEXT,
    madre_esposo TEXT,
    padre_esposa TEXT,
    madre_esposa TEXT,
    parroquia_bautismo_esposo TEXT,
    libro_bautismo_esposo TEXT,
    folio_bautismo_esposo TEXT,
    parroquia_bautismo_esposa TEXT,
    libro_bautismo_esposa TEXT,
    folio_bautismo_esposa TEXT,
    testigo1 TEXT,
    testigo2 TEXT,
    da_fe TEXT,
    anotaciones TEXT,
    estado estado_partida DEFAULT 'activo',
    creado_por UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_por UUID REFERENCES auth.users(id),
    actualizado_en TIMESTAMPTZ,
    UNIQUE(folio, numero)
);

-- 4. Tabla: sacramentos_defuncion
CREATE TABLE public.sacramentos_defuncion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio INTEGER NOT NULL,
    numero INTEGER NOT NULL,
    parroquia TEXT NOT NULL DEFAULT 'Parroquia de Prueba',
    fecha_sepultura DATE NOT NULL,
    nombre_difunto TEXT NOT NULL,
    apellidos_difunto TEXT NOT NULL,
    lugar_origen TEXT,
    edad INTEGER,
    estado_civil TEXT,
    padre_difunto TEXT,
    madre_difunto TEXT,
    causa_muerte TEXT,
    fecha_muerte DATE,
    da_fe TEXT,
    anotaciones TEXT,
    parroquia_sepultura TEXT,
    estado estado_partida DEFAULT 'activo',
    creado_por UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_por UUID REFERENCES auth.users(id),
    actualizado_en TIMESTAMPTZ,
    UNIQUE(folio, numero)
);

-- 5. Tabla: audit_log (inmutable)
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla TEXT NOT NULL,
    operacion tipo_operacion NOT NULL,
    registro_id UUID NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    usuario_id UUID REFERENCES auth.users(id),
    usuario_email TEXT,
    usuario_rol TEXT,
    ip_address TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
