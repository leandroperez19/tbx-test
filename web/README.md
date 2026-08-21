# Web

Cliente web que consume la API y muestra en pantalla la información de los
archivos procesados.

## Requisitos

- Node.js 16 (ver [`.nvmrc`](./.nvmrc))
- npm 6 o superior

No requiere variables de entorno, librerías instaladas globalmente ni
configuraciones específicas del sistema operativo.

## Instalación y ejecución

```bash
npm install
npm start           # servidor de desarrollo en http://localhost:8080
npm run build       # build de producción en dist/
npm test            # tests unitarios con Jest
npm run lint        # verifica el estilo con StandardJS
```

La aplicación espera que la API esté corriendo en `http://localhost:3000`. Ese
valor se inyecta en tiempo de build y puede sobrescribirse con la variable de
entorno `API_BASE_URL`:

```bash
API_BASE_URL=http://otro-host:3000 npm run build
```

## Funcionalidad

- Tabla con una fila por línea válida, con las columnas File Name, Text,
  Number y Hex.
- Selector para filtrar por un archivo puntual, alimentado por `GET /files/list`.
- Estados diferenciados de carga, error y resultado vacío.

## Estructura

```
src/
├── index.js              Punto de entrada: Provider de Redux y error boundary
├── app.js                Composición de la pantalla
├── styles.css            Estilos propios de la aplicación
├── components/           Componentes de presentación
│   ├── ErrorBoundary.js  Captura errores de render
│   ├── FileFilter.js     Selector de archivo
│   ├── FilesTable.js     Tabla de resultados
│   └── StatusMessage.js  Estados de carga y error
├── hooks/
│   └── useFilesData.js   Única frontera entre la vista y el store
├── services/
│   ├── requestHandler.js Capa de transporte HTTP
│   └── filesService.js   Endpoints y validación de las respuestas
└── store/
    ├── index.js          Configuración del store
    └── filesSlice.js     Estado, thunks y selectores
```

## Decisiones de diseño

### Validación de las respuestas de la API

Cada respuesta se valida antes de llegar a los componentes: se verifica que sea
un array, que cada entrada tenga `file` y `lines`, y que cada línea tenga `text`,
`number` y `hex` con los tipos esperados.

Es la misma disciplina que la API aplica sobre los CSV del servicio externo. La
API no confía en la forma de los datos de terceros; el cliente no confía en la
forma de los datos de la API. Un cambio inesperado en el contrato se detecta en
la capa de servicios y se convierte en un mensaje de error visible, en lugar de
romper el render con un dato indefinido.

### Resultados en lugar de excepciones

La capa de transporte nunca lanza: devuelve `{ status: 'success', data }` o
`{ status: 'error', error }`. Un resultado discriminado obliga a contemplar el
caso de error de forma explícita, mientras que una excepción puede pasarse por
alto si falta un `try/catch`.

El `parser` de cada respuesta se inyecta por parámetro, de modo que la capa de
transporte conoce el protocolo pero no la forma de los datos, y cada servicio
decide cómo validar lo suyo.

### Un solo campo de estado

El estado de la carga se representa con `status: 'loading' | 'success' | 'error'`
en lugar de banderas independientes. Con banderas separadas es posible alcanzar
combinaciones contradictorias, como estar cargando y con error a la vez; con un
único campo esos estados no existen.

### Redux Toolkit

El enunciado propone Redux como punto opcional. Se usa Redux Toolkit por ser la
forma recomendada oficialmente en la documentación de Redux, y porque incluye
`redux-thunk`, lo que evita sumar una dependencia adicional.

El hook `useFilesData` es la única frontera con el store: los componentes reciben
datos por props y desconocen la librería de estado, por lo que reemplazarla no
implicaría tocar la capa de presentación.

### Aplanado en el cliente

La API agrupa las líneas por archivo, mientras que el wireframe muestra una fila
por línea repitiendo el nombre del archivo. La transformación se hace en el
cliente para no alterar el contrato de respuesta que define el enunciado.

### Cancelación de peticiones

Al cambiar el archivo seleccionado se aborta la petición en curso. Sin eso, una
respuesta lenta correspondiente a una selección anterior podría llegar después
de la nueva y sobrescribir los datos correctos.

### Manejo de errores en dos capas

- Los errores **asincrónicos** (la API falla, se agota el tiempo de espera, no
  hay red) los resuelve la capa de servicios y terminan en un mensaje visible.
- Los errores de **render** los captura el error boundary, que muestra una
  pantalla de recuperación en lugar de dejar la página en blanco.

Entre ambas capas, ningún camino de error termina en una pantalla vacía.

### El único componente de clase

`ErrorBoundary` es el único componente de clase de la aplicación. React no expone
una API de hooks equivalente: un error boundary requiere `getDerivedStateFromError`
y `componentDidCatch`, que sólo existen en componentes de clase. El resto del
código usa componentes funcionales y hooks, como pide el enunciado.

### Babel

El enunciado prohíbe Babel en la API, pero no lo incluye entre las herramientas
vedadas para el frontend. Se usa para transformar JSX, que no puede ejecutarse
en el navegador sin transpilación.

### Versiones de las dependencias

Algunas versiones están acotadas por el requisito de correr sobre Node 16:

| Paquete             | Restricción |
|---------------------|-------------|
| `webpack-dev-server` | Se fija la versión `4.x`: la `5.x` requiere Node 18 o superior. |
| `babel-loader`       | Se fija la versión `9.x`: la `10.x` requiere Node 18 o superior. |

## Tests

```bash
npm test
```

- `test/components/` — render de los componentes con Testing Library.
- `test/store/` — transiciones del reducer.
- `test/__mocks__/` — datos de prueba y sustituto de los archivos CSS, que
  jsdom no procesa.

Las consultas usan roles y textos visibles en lugar de identificadores de
prueba, de modo que los tests ejerciten la interfaz del mismo modo que un
usuario y validen de paso la semántica del marcado.