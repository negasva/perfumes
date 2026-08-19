# Catálogo AURVM Fragancias

Catálogo web de 451 referencias. Sin frameworks, sin build. Abres `index.html` y ya.

## Poner tu WhatsApp

Línea 2 de `app.js`:

    const WHATSAPP = '573000000000';

Cambia el número. Formato internacional, sin el signo +. Ejemplo Colombia: 573001234567.

## Publicar en GitHub Pages

1. Crea repositorio nuevo, público, sin README.
2. Sube todos los archivos de esta carpeta a la raíz del repo.
3. Settings, Pages, Source: Deploy from a branch, Branch: main, carpeta `/root`, Save.
4. Espera un minuto. Tu dirección: `https://TUUSUARIO.github.io/NOMBREREPO/`

## Precios

Se calculan solos en `app.js`, líneas 6 a 8. La base es la línea diseñador:

    const BASE = { 30: 25000, 50: 35000, 100: 100000 };
    const FACTOR = { disenador: 1, arabe: 1.25, nicho: 1.4 };

Árabes van por 1.25 y nicho por 1.4, redondeando siempre al mil de arriba.
Hoy queda así:

    diseñador   25.000 / 35.000 / 100.000
    árabes      32.000 / 44.000 / 125.000
    nicho       35.000 / 49.000 / 140.000

Para subir todo, cambias los tres números de `BASE` y listo.

## Agregar o quitar perfumes

Todo vive en `data.js`. Una línea por referencia:

    {"n":"01","i":"Armaf Iconic","g":"hombre","s":"arabe","img":"img/01.webp"}

- `n` número
- `i` perfume en que se inspira
- `g` hombre, mujer o unisex
- `s` arabe, disenador o nicho
- `img` ruta de la foto

Foto nueva: guárdala en `img/` con fondo negro, cuadrada, unos 340 px, en .webp o .jpg.

## Enlaces con filtro puesto

La dirección guarda los filtros. Sirve para compartir una selección directa por WhatsApp:

    ?g=mujer          solo mujer
    ?l=nicho          solo nicho
    ?g=hombre&l=arabe hombre y árabes
    ?q=hawas          búsqueda

## Archivos

    index.html   página
    styles.css   estilos
    app.js       filtros, buscador, ficha, WhatsApp
    data.js      las 451 referencias
    img/         fotos, fondo y sellos
    fonts/       Benzin Extra Bold y Courier M Bold

## Licencia de las fuentes

Las dos tipografías van incrustadas. Antes de publicar revisa que tu licencia
cubra uso web. Si no, cámbialas en `styles.css`, arriba del todo.
