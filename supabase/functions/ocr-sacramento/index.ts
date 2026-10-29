// supabase/functions/ocr-sacramento/index.ts
// -----------------------------------------------------------------------------
// Supabase Edge Function: ocr-sacramento
// 
// IMPORTANTE - Configuración de secretos en Supabase:
// Ejecuta el siguiente comando desde la terminal de Supabase CLI o configúralo
// en Supabase Dashboard -> Edge Functions -> Secrets:
//   supabase secrets set GEMINI_API_KEY=tu_clave_de_gemini
// -----------------------------------------------------------------------------

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Manejo de Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "La variable de entorno GEMINI_API_KEY no está configurada en los secretos de Supabase." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, mimeType, tipo, prevSchema } = await req.json();

    if (!imageBase64 || !tipo) {
      return new Response(
        JSON.stringify({ error: "Se requieren los campos imageBase64 y tipo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let promptText = "";

    if (tipo === "bautismo") {
      promptText = `Eres un asistente especializado en digitalizar partidas de bautismo de libros parroquiales colombianos.
Analiza la imagen que puede ser de una única partida de bautismo o de una página completa con múltiples partidas (filas de una tabla).

Tu objetivo es extraer la información y devolver un objeto JSON con la siguiente estructura exacta (sin texto adicional, sin backticks, sin markdown):
{
  "es_legible": true,
  "modo_extraccion": "individual" | "masivo",
  "registros": [
    {
      "libro": null,
      "folio": null,
      "numero": null,
      "nombre_bautizado": null,
      "apellidos_bautizado": null,
      "fecha_bautismo": null,
      "fecha_nacimiento": null,
      "lugar_nacimiento": null,
      "nombre_padre": null,
      "nombre_madre": null,
      "abuelos_paternos": null,
      "abuelos_maternos": null,
      "padrino": null,
      "madrina": null,
      "ministro": null,
      "da_fe": null,
      "anotaciones": null
    }
  ],
  "esquema_columnas": {
    "tiene_encabezados": false,
    "columnas": null,
    "descripcion": null
  }
}

Reglas críticas de extracción:
0. VALIDACIÓN DE CALIDAD Y LEGIBILIDAD (MUY IMPORTANTE):
   Evalúa primero si la imagen es legible. Si la imagen es de muy mala calidad, desenfocada, excesivamente borrosa, oscura, quemada o resulta imposible de leer el documento:
   Debes responder estrictamente con:
   {
     "es_legible": false,
     "error": "No se pudo leer el documento. Adjunte una imagen nítida en JPG o PNG",
     "modo_extraccion": "individual",
     "registros": []
   }
   Si la imagen es legible, incluye "es_legible": true y extrae los registros normalmente.
1. Determina si el documento contiene un único registro ("individual") o una tabla con múltiples registros ("masivo").
2. Si detectas múltiples registros, crea un objeto para cada uno en la lista de "registros".
3. Analiza el encabezado de la página: si contiene información común (ej. Libro, Folio, Ministro, Fecha de Bautismo), debes propagar y aplicar automáticamente esos valores a cada registro de la lista de "registros".
4. Para el campo 'da_fe', busca el texto que declara certificar o dar fe del acto (ej. 'Doy fe: [Nombre]'). Extrae el nombre de la persona que da fe/firma.
5. Para los campos 'nombre_padre', 'nombre_madre', 'abuelos_paternos' y 'abuelos_maternos', si en el texto de la imagen no se mencionan o dicen 'hijo natural', pon exactamente 'No registra'.
6. Si un campo no se encuentra en la imagen, déjalo como null o string vacío.
7. Identifica si la imagen contiene encabezados de columnas explícitos. Si es así, pon "tiene_encabezados" como true en "esquema_columnas", lista las columnas en "columnas" y describe el formato en "descripcion". Si no los contiene, pon "tiene_encabezados" como false.`;
    } else if (tipo === "confirmacion") {
      promptText = `Eres un asistente de digitalización de libros sacramentales de la Iglesia Católica.
Analiza la imagen que puede ser de una única partida de confirmación o de una página completa con múltiples partidas (filas de una tabla).

Tu objetivo es extraer la información y devolver un objeto JSON con la siguiente estructura exacta (sin texto adicional, sin backticks, sin markdown):
{
  "es_legible": true,
  "modo_extraccion": "individual" | "masivo",
  "registros": [
    {
      "libro": null,
      "folio": null,
      "numero": null,
      "nombre_confirmado": null,
      "apellidos_confirmado": null,
      "fecha_confirmacion": null,
      "anio_confirmacion": null,
      "fecha_nacimiento": null,
      "lugar_nacimiento": null,
      "lugar_confirmacion": null,
      "nombre_padre": null,
      "nombre_madre": null,
      "padrino_madrina": null,
      "ministro": null,
      "obispo": null,
      "parroquia_bautismo": null,
      "diocesis": null,
      "dia_semana": null,
      "numero_libro_bautismo": null,
      "folio_bautismo": null,
      "numero_bautismo": null,
      "da_fe": null,
      "anotaciones": null
    }
  ],
  "esquema_columnas": {
    "tiene_encabezados": false,
    "columnas": null,
    "descripcion": null
  }
}

Reglas críticas de extracción:
0. VALIDACIÓN DE CALIDAD Y LEGIBILIDAD (MUY IMPORTANTE):
   Evalúa primero si la imagen es legible. Si la imagen es de muy mala calidad, desenfocada, excesivamente borrosa, oscura, quemada o resulta imposible de leer el documento:
   Debes responder estrictamente con:
   {
     "es_legible": false,
     "error": "No se pudo leer el documento. Adjunte una imagen nítida en JPG o PNG",
     "modo_extraccion": "individual",
     "registros": []
   }
   Si la imagen es legible, incluye "es_legible": true y extrae los registros normalmente.
1. Determina si el documento contiene un único registro ("individual") o una tabla con múltiples registros ("masivo").
2. Si detectas múltiples registros, crea un objeto para cada uno en la lista de "registros".
3. Analiza el encabezado de la página: si contiene información común (ej. Libro, Folio, Ministro que Confirma, Obispo, Año, Lugar de Confirmación), debes propagar y aplicar automáticamente esos valores a cada registro de la lista de "registros", a menos que una fila específica indique explícitamente un valor diferente.
4. Si un dato no existe o no aparece en el documento, establécelo estrictamente como null o string vacío según corresponda. NUNCA inventes información.
5. Si un dato está incompleto o es ilegible, establécelo como null.
6. Si para la confirmación se registra una fecha completa (ej: "12 de mayo de 1995"), llena "fecha_confirmacion" como "1995-05-12" y "anio_confirmacion" como 1995.
7. Si solo se registra el año (ej: "Confirmados en 1995"), llena "fecha_confirmacion" como null y "anio_confirmacion" como 1995.
8. Si se registra la fecha completa de nacimiento (ej: "nacido el 4 de agosto de 1980"), llena "fecha_nacimiento" como "1980-08-04".
9. Si no se mencionan los padres o padrinos, llena esos campos como null.
10. Si el obispo está presente pero no el ministro que confirma, copia el mismo valor del obispo en el campo "ministro".
11. Conserve la ortografía exacta de nombres y apellidos (mayúsculas, tildes, etc.).
12. Devuelve únicamente el objeto JSON válido.
13. Identifica si la imagen contiene encabezados de columnas explícitos que identifiquen los datos de cada columna. Si es así, pon "tiene_encabezados" como true en "esquema_columnas", lista las columnas en "columnas" y describe el formato en "descripcion". Si no los contiene, pon "tiene_encabezados" como false.`;
    } else if (tipo === "defuncion") {
      promptText = `Eres un asistente especializado en digitalizar partidas de defunción de libros parroquiales colombianos.
Analiza la imagen que puede ser de una única partida de defunción o de una página completa con múltiples partidas (filas de una tabla).

Tu objetivo es extraer la información y devolver un objeto JSON con la siguiente estructura exacta (sin texto adicional, sin backticks, sin markdown):
{
  "es_legible": true,
  "modo_extraccion": "individual" | "masivo",
  "registros": [
    {
      "libro": null,
      "folio": null,
      "numero": null,
      "nombre_difunto": null,
      "apellidos_difunto": null,
      "fecha_defuncion": "YYYY-MM-DD",
      "edad": null,
      "lugar_origen": null,
      "estado_civil": null,
      "padre_difunto": null,
      "madre_difunto": null,
      "causa_muerte": null,
      "da_fe": null,
      "anotaciones": null
    }
  ],
  "esquema_columnas": {
    "tiene_encabezados": false,
    "columnas": null,
    "descripcion": null
  }
}

Reglas críticas de extracción:
0. VALIDACIÓN DE CALIDAD Y LEGIBILIDAD (MUY IMPORTANTE):
   Evalúa primero si la imagen es legible. Si la imagen es de muy mala calidad, desenfocada, excesivamente borrosa, oscura, quemada o resulta imposible de leer el documento:
   Debes responder estrictamente con:
   {
     "es_legible": false,
     "error": "No se pudo leer el documento. Adjunte una imagen nítida en JPG o PNG",
     "modo_extraccion": "individual",
     "registros": []
   }
   Si la imagen es legible, incluye "es_legible": true y extrae los registros normalmente.
1. Determina si el documento contiene un único registro ("individual") o una tabla con múltiples registros ("masivo").
2. Si detectas múltiples registros, crea un objeto para cada uno en la lista de "registros".
3. Analiza el encabezado de la página: si contiene información común (ej. Libro, Folio), debes propagar y aplicar automáticamente esos valores a cada registro de la lista de "registros".
4. Para el campo 'da_fe', busca el texto que declara certificar o dar fe del acto. Extrae el nombre de la persona que da fe/firma.
5. Para los campos de personas ('padre_difunto', 'madre_difunto'), si no se mencionan en la imagen, pon exactamente 'No registra'.
6. Si un campo no se encuentra en la imagen, déjalo como null o string vacío.
7. Identifica si la imagen contiene encabezados de columnas explícitos. Si es así, pon "tiene_encabezados" como true en "esquema_columnas", lista las columnas en "columnas" y describe el formato en "descripcion". Si no los contiene, pon "tiene_encabezados" como false.`;
    } else if (tipo === "matrimonio") {
      promptText = `Eres un asistente especializado en digitalizar partidas de matrimonio de libros parroquiales colombianos.
Analiza la imagen que puede ser de una única partida de matrimonio o de una página completa con múltiples partidas (filas de una tabla).

Tu objetivo es extraer la información y devolver un objeto JSON con la siguiente estructura exacta (sin texto adicional, sin backticks, sin markdown):
{
  "es_legible": true,
  "modo_extraccion": "individual" | "masivo",
  "registros": [
    {
      "libro": null,
      "folio": null,
      "numero": null,
      "parroquia": null,
      "fecha_matrimonio": "YYYY-MM-DD",
      "presencio": null,
      "nombre_esposo": null,
      "apellidos_esposo": null,
      "nombre_esposa": null,
      "apellidos_esposa": null,
      "padre_esposo": null,
      "madre_esposo": null,
      "padre_esposa": null,
      "madre_esposa": null,
      "parroquia_bautismo_esposo": null,
      "fecha_bautismo_esposo": "YYYY-MM-DD",
      "libro_bautismo_esposo": null,
      "folio_bautismo_esposo": null,
      "numero_bautismo_esposo": null,
      "parroquia_bautismo_esposa": null,
      "fecha_bautismo_esposa": "YYYY-MM-DD",
      "libro_bautismo_esposa": null,
      "folio_bautismo_esposa": null,
      "numero_bautismo_esposa": null,
      "testigo1": null,
      "testigo2": null,
      "da_fe": null,
      "anotaciones": null
    }
  ],
  "esquema_columnas": {
    "tiene_encabezados": false,
    "columnas": null,
    "descripcion": null
  }
}

Reglas críticas de extracción:
0. VALIDACIÓN DE CALIDAD Y LEGIBILIDAD (MUY IMPORTANTE):
   Evalúa primero si la imagen es legible. Si la imagen es de muy mala calidad, desenfocada, excesivamente borrosa, oscura, quemada o resulta imposible de leer el documento:
   Debes responder estrictamente con:
   {
     "es_legible": false,
     "error": "No se pudo leer el documento. Adjunte una imagen nítida en JPG o PNG",
     "modo_extraccion": "individual",
     "registros": []
   }
   Si la imagen es legible, incluye "es_legible": true y extrae los registros normalmente.
1. Determina si el documento contiene un único registro ("individual") o una tabla con múltiples registros ("masivo").
2. Si detectas múltiples registros, crea un objeto para cada uno en la lista de "registros".
3. Analiza el encabezado de la página: si contiene información común (ej. Libro, Folio, Parroquia, Fecha de Matrimonio, Presenció), debes propagar y aplicar automáticamente esos valores a cada registro de la lista de "registros".
4. Para el campo 'parroquia', busca el nombre de la parroquia donde se celebró el matrimonio.
5. Para el campo 'presencio', busca el nombre de quien ofició o presenció el matrimonio.
6. Para el campo 'da_fe', busca el texto que declara certificar o dar fe del acto. Extrae el nombre de la persona que da fe/firma.
7. Para los campos de padres ('padre_esposo', 'madre_esposo', 'padre_esposa', 'madre_esposa'), si no se mencionan en la imagen, pon exactamente 'No registra'.
8. Si un campo no se encuentra en la imagen, déjalo como null o string vacío.
9. Identifica si la imagen contiene encabezados de columnas explícitos. Si es así, pon "tiene_encabezados" como true en "esquema_columnas", lista las columnas en "columnas" y describe el formato en "descripcion". Si no los contiene, pon "tiene_encabezados" como false.`;
    }

    if (prevSchema) {
      promptText += `

----------------------------------
Formato detectado previamente:
${prevSchema.descripcion}

Esta imagen pertenece al mismo libro.
Si la imagen no contiene encabezados, utiliza este esquema para interpretar las columnas.
----------------------------------`;
    }

    const requestBody = JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType || "image/jpeg",
                data: imageBase64,
              },
            },
            { text: promptText },
          ],
        },
      ],
    });

    const model = "gemini-flash-lite-latest";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Error Gemini API (${geminiRes.status}): ${errText}` }),
        { status: geminiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    return new Response(JSON.stringify(geminiData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error interno en Edge Function" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
