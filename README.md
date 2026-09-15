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
- Parkour-style separated obstacle controls with guide lines;
- green editable handles for lines, arrows, curves, connections and circles;
- independent line actions in the right inspector: duplicate, delete, add point and remove point;
- linked connection endpoints that remain attached while intermediate points are edited;
- line duplication that creates an independent editable copy.
- ordered execution of the course and independent line objects, with letter-based order confirmation;
- editable line color, width and solid/dashed stroke styles;
- generic joins between independent lines, curves, arrows and circles;
- contextual prompt when placing an obstacle over a line or course path;
- manual obstacle numbering preserved when automatic ordering is used;
- additional green control points for the main course path.

## Auditoría de la v1.0

### Ya está sólido

- canvas ligero, sin dependencias externas, con vista cenital y perspectiva 3D;
- colocación, arrastre, duplicado, inspector, numeración y tipos básicos de obstáculos;
- animación de recorrido, cuadrícula, sombras, controles de cámara y demo reproducible;
- diseño responsive inicial y guardado local en JSON.

### Bloque integrado actual

- rotation, height and width controls use independent touch targets;
- deleting an obstacle preserves route geometry and detaches affected connections;
- moving a linked obstacle updates the connected line endpoints;
- lines, arrows, curves and circles can be selected and edited directly on the arena;
- curve and circle creation remains performed on the editing track, not in the sidebar.

### Próximas prioridades

1. edición directa de vértices y puntos intermedios con selección visual;
2. manipulación táctil de rotación y tamaño de obstáculos, con restricciones y medidas;
3. modelo de recorrido con tramos, curvas y reglas de continuidad;
4. exportación de imagen/PDF y captura de recorrido animado en formato compatible con Drive;
5. pruebas reales en Safari iPad/iPhone, incluyendo gestos, orientación y pantallas pequeñas;
6. validación ecuestre: numeración, distancias, combinaciones, sentido de salto y ficha técnica.

The app must be served as a real web app (for example through GitHub Pages); opening the HTML from Files/Quick Look is not a valid runtime test for JavaScript.

## Caballo cenital — 15 septiembre 2026

1. Abre tu JSON anterior, crea un recorrido o pulsa **Cargar recorrido demo**.
2. En la barra derecha, abre **Caballo · plano cenital**. Ya incluye el caballo cenital aportado como referencia.
3. Elige la duración (40 segundos por defecto), tamaño y orientación. **Girar imagen 180°** corrige una imagen que mira hacia atrás.
4. Pulsa **Ejecutar**. **Pausar / Continuar** conserva la posición. **Reiniciar recorrido** devuelve el editor al inicio.
5. **Guardar JSON** incluye la imagen y sus ajustes. **Guardar caballo** conserva una copia en este navegador; **Recuperar guardado** la recupera.
6. **Grabar ejecución como video** usa la capacidad de grabación del navegador; el formato depende del dispositivo. No se garantiza MP4 en todos los navegadores.

El caballo y el trazo usan una única distancia acumulada y un único reloj. El tamaño se expresa en metros de la pista. La línea termina detrás del centro del caballo; la separación adicional se mide sobre la curva. Se conservan las curvas del editor y el orden de los elementos. Los elementos separados se reproducen por tramos: usa **Conectar** si necesitas continuidad entre ellos.

La imagen se desplaza y gira en el plano cenital; no anima patas. Cargar JPG no elimina su fondo: usar preferentemente PNG transparente. Brillo, contraste y saturación se procesan en la imagen, sin depender de filtros Canvas de Safari. Las imágenes cargadas se reducen a un máximo de 1024 px para limitar memoria.

Validación de esta entrega: sintaxis JavaScript; pruebas de distancia uniforme, puntos repetidos, cruces, pertenencia a la curva y duración a 30/60/120 fps; arranque, reloj y serialización con DOM simulado; prueba en Chromium real de ejecución completa, pausa/continuación, guardado/recuperación, exportación/importación JSON, proyecto vacío y ausencia de desbordamiento a 390 px. Inspección visual a 1194 × 834 y 390 × 844. La prueba física en Safari/iPad queda pendiente.

Para ejecutar las pruebas matemáticas: `node tests/cenital.test.cjs`.
