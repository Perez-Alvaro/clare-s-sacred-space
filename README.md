# clare-hm-shop

Generar una LANDING PAGE completa, profesional y lista para desarrollo para el emprendimiento artesanal católico **CLARE**, utilizando **Vite + React JS + CSS puro**, con una arquitectura de componentes clara, una guía de estilo completa y un diseño que respete estrictamente la estética del moodboard proporcionado y la identidad de la marca.

====================================================================
🎯 IDENTIDAD DE MARCA
====================================================================
CLARE es un emprendimiento de artesanías religiosas: oratorios de bolsillo, denarios, llaveros con medallas, macramé espiritual y objetos devocionales.  
Inspiración en la Sierva de Dios CLEAR (2015).  
Valores centrales obligatorios en el diseño:  
**conexión, fe, amistad, camino, regalo, autenticidad, oración, propósito, alegría, Jesús.**

====================================================================
🎨 ESTILO VISUAL — MOODBOARD OBLIGATORIO
====================================================================
Basado en el moodboard “Cream Aesthetic Minimalist Vision Board”.  
Aplicar de forma estricta:

PALETA FRANCISCANA / CAPUCHINA  
- crema (#F8F1E9)  
- blanco cálido (#FFFDF8)  
- arena (#E8DCC3)  
- marrón suave (#9C7A56)  
- tierra (#8B6A4E)  
- acentos: terracota (#C17F5A) o verde olivo (#7A8A63)

TIPOGRAFÍA  
- Heading: serif suave, elegante, espiritual (ej. Cormorant Garamond / Playfair Display).  
- Body: sans-serif cálida y legible (ej. Nunito / Lato).  
- Opcional: manuscrita religiosa para detalles (ej. Great Vibes) sin abusar.

DIRECCIÓN DE ARTE  
- Minimalista, contemplativa, monástica moderna.  
- Amplio uso de espacios en blanco.  
- Fotografías cálidas, artesanales, con textura.  
- Microanimaciones sutiles: fade, opacity, slide suave.  
- Íconos minimalistas en estilo outline.

====================================================================
🧱 ARQUITECTURA DE COMPONENTES (React + Vite + CSS)
====================================================================

Generar estructura:

/src  
  /components  
    Hero.jsx  
    About.jsx  
    Collections.jsx  
    CollectionCard.jsx  
    GiftClouds.jsx  
    ValuesSection.jsx  
    CTASection.jsx  
    Footer.jsx  
  /layout  
    MainLayout.jsx  
  /styles  
    global.css  
    variables.css  
    components/*.css  
  /assets  
    imágenes/moodboard + placeholders de productos  
App.jsx  
main.jsx  
index.html

REQUISITOS TÉCNICOS  
- React funcional (hooks).  
- CSS puro, modularizado por componente.  
- Sin Tailwind, sin Bootstrap, sin librerías pesadas.  
- Animaciones con CSS (no framer-motion).  
- Optimización performance: imágenes lazy, carga mínima, Lighthouse 90+.  
- SEO básico: meta tags + semántica HTML5.  
- Mobile-first.

====================================================================
📐 ESTRUCTURA DE LA LANDING PAGE
====================================================================

1) HERO  
- Título: “CLARE — artes con propósito, camino y oración.”  
- Subtítulo emocional religioso.  
- 2 CTAs: “Ver Tienda” y “Comprar Nube de Regalo”

2) ABOUT (Historia + Espiritualidad)  
- Inspiración en CLEAR.  
- Misión: regalos con fe, camino y conexión.  
- Diseño minimalista, dos columnas o stacked.

3) COLECCIONES  
- Grid con <CollectionCard />:  
  - Oratorios de bolsillo  
  - Denarios  
  - Llavero devocional  
  - Macramé espiritual  
- Cada card con título + imagen + botón “Ver productos”.

4) NUBES DE REGALO  
- Explicación breve.  
- Botones con hipervínculos externos editables.  
- Estética suave y cálida.

5) VALORES  
- Íconos minimalistas.  
- Cards para: Conexión, Fe, Amistad, Propósito/Camino.

6) CTA FINAL  
- Mensaje espiritual + 2 botones:
  - “Entrar a la Tienda”
  - “Contactar por WhatsApp”

7) FOOTER  
- Redes sociales  
- Links a tiendas externas  
- Contacto y navegación esencial

====================================================================
📗 GUÍA DE ESTILO COMPLETA (Brand + UX + UI)
====================================================================

TONO DE COMUNICACIÓN  
- Cálido, espiritual, cercano.  
- Simplicidad franciscana.  
- Frases cortas, inspiradoras.  
- Nada técnico, nada comercial agresivo.

MICROCOPY OBLIGATORIO  
- "Regalos que acompañan el camino."  
- "Fe que se teje en cada detalle."  
- "Oración en movimiento."  
- "Conexión que nace del corazón."

BOTONES  
- Bordes redondeados (8–12px).  
- Hover: +5% de sombra suave y leve elevación.  
- Color: terracota u olivo.

SPACING / LAYOUT  
- Espaciado vertical generoso.  
- Line-height amplio (1.6+).  
- Diseño aireado, limpio y contemplativo.

IMÁGENES  
- Estilo artesanal, cálido, natural.  
- Evitar saturación y colores brillantes.

ICONOGRAFÍA  
- Minimalista outline.  
- Colores tierra u olivo.  
- Iconos pequeños (24px).

ACCESIBILIDAD  
- Contraste AA.  
- Botones legibles.  
- Navegación simple.

====================================================================
📄 ENTREGA ESPERADA
====================================================================
Generar:

1. **El código completo del proyecto** en Vite + React + CSS puro.  
2. Todos los componentes totalmente implementados.  
3. Archivos CSS con variables, modularización y estilo según guía.  
4. Textos redactados y adaptados a la identidad espiritual CLARE.  
5. Instrucciones finales de uso e integración de links externos.  

====================================================================
🎯 OBJETIVO FINAL
====================================================================
La landing debe verse como un producto artesanal, espiritual, cálido y profesional.  
Debe respetar fielmente el moodboard, la espiritualidad franciscana y la identidad única de CLARE, y estar lista para deploy y crecimiento futuro.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://clare-hm-shop.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/06e2393e-2e43-4c84-8d7f-b9d3eb02e615).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
