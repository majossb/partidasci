-- supabase/seed/datos_ficticios.sql
-- Datos de prueba 100% ficticios para entorno de desarrollo universitario.
-- NO contiene información de personas reales.

-- ============================================================================
-- 1. CONFIGURACIÓN INICIAL DEL SISTEMA
-- ============================================================================
INSERT INTO public.configuracion_parroquia (clave, valor)
VALUES 
    ('sesion_timeout_minutos', '30'),
    ('nombre_parroquia', 'Parroquia de Prueba'),
    ('diocesis', 'Diócesis de Prueba'),
    ('ciudad', 'Ciudad de Prueba'),
    ('telefono', '6000000000')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;

-- ============================================================================
-- 2. PARTIDAS FICTICIAS DE BAUTISMO
-- ============================================================================
INSERT INTO public.sacramentos_bautismo (
    libro, folio, numero, parroquia, fecha_bautismo, ministro,
    nombre_bautizado, apellidos_bautizado, fecha_nacimiento, lugar_nacimiento,
    nombre_padre, nombre_madre, abuelos_paternos, abuelos_maternos,
    padrino, madrina, da_fe, anotaciones, estado
) VALUES 
(
    '1', 10, 1, 'Parroquia de Prueba', '2024-01-15', 'Pbro. Andrés Delgado',
    'Santiago', 'Pérez Gómez', '2023-11-20', 'Ciudad Capital',
    'Carlos Pérez', 'Laura Gómez', 'Alberto Pérez y Gloria Silva', 'Fernando Gómez y Elena Ruiz',
    'Mateo Morales', 'Valentina Castro', 'El Párroco', 'Ninguna', 'activo'
),
(
    '1', 10, 2, 'Parroquia de Prueba', '2024-02-18', 'Pbro. Andrés Delgado',
    'Sofía', 'Rodríguez Martínez', '2023-12-05', 'Ciudad Central',
    'Jorge Rodríguez', 'Marcela Martínez', 'Hernán Rodríguez y Alicia Vargas', 'Roberto Martínez y Teresa Vega',
    'David Torres', 'Camila Ortiz', 'El Párroco', 'Ninguna', 'activo'
),
(
    '1', 11, 3, 'Parroquia de Prueba', '2024-03-10', 'Pbro. Manuel Santos',
    'Lucas', 'Fernández Herrera', '2024-01-02', 'Ciudad Capital',
    'Gabriel Fernández', 'Daniela Herrera', 'Esteban Fernández y Rosa Medina', 'Javier Herrera y Patricia Lozano',
    'Felipe Moreno', 'Natalia Ríos', 'El Párroco', 'Ninguna', 'activo'
),
(
    '1', 11, 4, 'Parroquia de Prueba', '2024-04-05', 'Pbro. Andrés Delgado',
    'Emma', 'Ramírez Cárdenas', '2024-02-14', 'Pueblo Modelo',
    'Rodrigo Ramírez', 'Andrea Cárdenas', 'Marcos Ramírez y Lucía Campos', 'Guillermo Cárdenas y Clara Duarte',
    'Nicolás Peña', 'Juliana Soto', 'El Párroco', 'Ninguna', 'activo'
),
(
    '1', 12, 5, 'Parroquia de Prueba', '2024-05-20', 'Pbro. Manuel Santos',
    'Mateo', 'Suárez Navarro', '2024-03-22', 'Ciudad Central',
    'Esteban Suárez', 'Paula Navarro', 'Víctor Suárez y Beatriz Parra', 'Alonso Navarro y Carmen Gil',
    'Sebastián Blanco', 'Mariana Soler', 'El Párroco', 'Ninguna', 'activo'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. PARTIDAS FICTICIAS DE CONFIRMACIÓN
-- ============================================================================
INSERT INTO public.sacramentos_confirmacion (
    libro, folio, numero, parroquia, fecha_confirmacion, anio_confirmacion,
    ministro, nombre_confirmado, apellidos_confirmado, lugar_confirmacion,
    nombre_padre, nombre_madre, padrino_madrina, parroquia_bautismo,
    diocesis, dia_semana, numero_libro_bautismo, folio_bautismo, numero_bautismo,
    fecha_nacimiento, lugar_nacimiento, obispo, da_fe, anotaciones, estado
) VALUES 
(
    '1', 5, 1, 'Parroquia de Prueba', '2024-06-15', 2024,
    'Mons. Ricardo Valenzuela', 'Alejandro', 'Torres Benítez', 'Templo Principal',
    'Gonzalo Torres', 'Claudia Benítez', 'Héctor Salgado', 'Parroquia de Prueba',
    'Diócesis de Prueba', 'Sábado', '1', '10', '1',
    '2008-04-12', 'Ciudad Capital', 'Mons. Ricardo Valenzuela', 'El Párroco', 'Ninguna', 'activo'
),
(
    '1', 5, 2, 'Parroquia de Prueba', '2024-06-15', 2024,
    'Mons. Ricardo Valenzuela', 'Isabella', 'Mendoza Ospina', 'Templo Principal',
    'Mauricio Mendoza', 'Lorena Ospina', 'Adriana Beltrán', 'Parroquia El Sol',
    'Diócesis de Prueba', 'Sábado', '2', '45', '12',
    '2008-08-25', 'Ciudad Central', 'Mons. Ricardo Valenzuela', 'El Párroco', 'Ninguna', 'activo'
),
(
    '1', 6, 3, 'Parroquia de Prueba', '2024-07-20', 2024,
    'Pbro. Andrés Delgado', 'Samuel', 'Pardo Quintana', 'Capilla San Marcos',
    'Fabián Pardo', 'Mónica Quintana', 'Germán Lara', 'Parroquia Santa Fe',
    'Diócesis Vecina', 'Sábado', '1', '22', '8',
    '2009-01-18', 'Ciudad Norte', 'Mons. Ricardo Valenzuela', 'El Párroco', 'Ninguna', 'activo'
),
(
    '1', 6, 4, 'Parroquia de Prueba', '2024-07-20', 2024,
    'Pbro. Andrés Delgado', 'Luciana', 'Vargas Cordero', 'Capilla San Marcos',
    'Julio Vargas', 'Esperanza Cordero', 'Paola Méndez', 'Parroquia de Prueba',
    'Diócesis Universitaria', 'Sábado', '1', '15', '20',
    '2009-05-30', 'Ciudad Capital', 'Mons. Ricardo Valenzuela', 'El Párroco', 'Ninguna', 'activo'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. PARTIDAS FICTICIAS DE MATRIMONIO
-- ============================================================================
INSERT INTO public.sacramentos_matrimonio (
    libro, folio, numero, parroquia, fecha_matrimonio,
    nombre_esposo, apellidos_esposo, nombre_esposa, apellidos_esposa,
    padre_esposo, madre_esposo, padre_esposa, madre_esposa,
    parroquia_bautismo_esposo, libro_bautismo_esposo, folio_bautismo_esposo, numero_bautismo_esposo, fecha_bautismo_esposo,
    parroquia_bautismo_esposa, libro_bautismo_esposa, folio_bautismo_esposa, numero_bautismo_esposa, fecha_bautismo_esposa,
    testigo1, testigo2, presencio, da_fe, anotaciones, estado
) VALUES 
(
    '1', 2, 1, 'Parroquia de Prueba', '2024-08-10',
    'Daniel', 'Castillo Rivas', 'Gabriela', 'Paredes Franco',
    'Arturo Castillo', 'Luz Rivas', 'Eduardo Paredes', 'Marina Franco',
    'Parroquia de Prueba', '1', '25', '10', '1996-03-14',
    'Parroquia San Pedro', '2', '14', '7', '1997-07-22',
    'Tomás Castillo Rivas', 'Verónica Paredes Franco', 'Pbro. Andrés Delgado', 'El Párroco', 'Ninguna', 'activo'
),
(
    '1', 2, 2, 'Parroquia de Prueba', '2024-09-14',
    'Julián', 'Morales Becerra', 'Catalina', 'Guerrero Silva',
    'Santiago Morales', 'Inés Becerra', 'Felipe Guerrero', 'Clara Silva',
    'Parroquia San Lucas', '3', '50', '2', '1995-10-05',
    'Parroquia de Prueba', '1', '30', '15', '1996-12-19',
    'Andrés Morales Becerra', 'Diana Guerrero Silva', 'Pbro. Manuel Santos', 'El Párroco', 'Ninguna', 'activo'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. PARTIDAS FICTICIAS DE DEFUNCIÓN
-- ============================================================================
INSERT INTO public.sacramentos_defuncion (
    libro, folio, numero, parroquia, fecha_sepultura,
    nombre_difunto, apellidos_difunto, lugar_origen, edad, estado_civil,
    padre_difunto, madre_difunto, causa_muerte, fecha_muerte,
    da_fe, anotaciones, parroquia_sepultura, estado
) VALUES 
(
    '1', 1, 1, 'Parroquia de Prueba', '2024-05-12',
    'Bernardo', 'Montoya Salcedo', 'Pueblo Modelo', '78', 'Casado(a)',
    'Ramiro Montoya', 'Mercedes Salcedo', 'Causas naturales', '2024-05-10',
    'El Párroco', 'Ninguna', 'Parroquia de Prueba', 'activo'
),
(
    '1', 1, 2, 'Parroquia de Prueba', '2024-09-02',
    'Matilde', 'Guzmán Restrepo', 'Ciudad Central', '84', 'Viudo(a)',
    'Ernesto Guzmán', 'Teresa Restrepo', 'Falla cardíaca', '2024-08-31',
    'El Párroco', 'Ninguna', 'Parroquia de Prueba', 'activo'
)
ON CONFLICT DO NOTHING;
