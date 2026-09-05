# FAAS Equestrian 3D Academy

Professional equestrian course-design and visualization tool by Equitación Punta del Este.

## Fase 1 — base de edición

The current working slice adds:

- independent route geometry: salida, llegada, línea recta, línea con flecha y círculo;
- route nodes that preserve their coordinates when the linked obstacle is deleted;
- undo/redo with a four-state history limit;
- JSON `version: 0.4` export and backward loading of the previous obstacle-id route format;
- touch-friendly controls for iPad and mobile.
- visual obstacle handles: blue handle for rotation and yellow handle for width/size;
- red handle for obstacle height adjustment with mouse or touch;
- PNG export with a dated filename for sharing in Drive;
- connector mode with entry/exit points for independent obstacle-to-obstacle course segments;

## Auditoría de la v1.0

### Ya está sólido

- canvas ligero, sin dependencias externas, con vista cenital y perspectiva 3D;
- colocación, arrastre, duplicado, inspector, numeración y tipos básicos de obstáculos;
- animación de recorrido, cuadrícula, sombras, controles de cámara y demo reproducible;
- diseño responsive inicial y guardado local en JSON.

### Próximas prioridades

1. edición directa de vértices y puntos intermedios con selección visual;
2. manipulación táctil de rotación y tamaño de obstáculos, con restricciones y medidas;
3. modelo de recorrido con tramos, curvas y reglas de continuidad;
4. exportación de imagen/PDF y captura de recorrido animado en formato compatible con Drive;
5. pruebas reales en Safari iPad/iPhone, incluyendo gestos, orientación y pantallas pequeñas;
6. validación ecuestre: numeración, distancias, combinaciones, sentido de salto y ficha técnica.

The app must be served as a real web app (for example through GitHub Pages); opening the HTML from Files/Quick Look is not a valid runtime test for JavaScript.
