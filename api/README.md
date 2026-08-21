# API

API REST que toma información del API externo de TBX, la valida y la
reformatea para exponerla como JSON.

## Requisitos

- Node.js 14 (ver [`.nvmrc`](./.nvmrc))
- npm 6 o superior

No requiere variables de entorno, librerías instaladas globalmente ni
configuraciones específicas del sistema operativo.

## Instalación y ejecución

```bash
npm install
npm start           # levanta la API en http://localhost:3000
npm test            # corre la suite de tests
npm run lint        # verifica el estilo con StandardJS
```

## Endpoints

### `GET /files/data`

Devuelve el contenido formateado de todos los archivos disponibles.

**Query params**

| Parámetro  | Tipo   | Requerido | Descripción |
|------------|--------|-----------|-------------|
| `fileName` | string | No        | Limita la respuesta a un único archivo. |

**Respuesta `200`**

```json
[
  {
    "file": "file1.csv",
    "lines": [
      {
        "text": "RgTya",
        "number": 64075909,
        "hex": "70ad29aacf0b690b0467fe2b2767f765"
      }
    ]
  }
]
```

```bash
curl -X GET "http://localhost:3000/files/data" -H "accept: application/json"
curl -X GET "http://localhost:3000/files/data?fileName=file1.csv" -H "accept: application/json"
```

### `GET /files/list`

Devuelve el listado de archivos disponibles con la misma forma que el API externo.

**Respuesta `200`**

```json
{ "files": ["file1.csv", "file2.csv"] }
```

## Contrato de errores

Todas las respuestas de error usan el mismo cuerpo, replicando el modelo
`Error` del Swagger del API externo, con el status HTTP correspondiente en
el header. Nunca se devuelve `200` con un error en el cuerpo.

```json
{ "code": "FILE_NOT_FOUND", "message": "El archivo x.csv no existe en el API externo" }
```

| Status | `code`               | Cuándo ocurre |
|--------|----------------------|---------------|
| 404    | `FILE_NOT_FOUND`     | El `fileName` pedido no está en el listado del API externo. |
| 404    | `ROUTE_NOT_FOUND`    | La ruta solicitada no existe en esta API. |
| 502    | `EXTERNAL_API_ERROR` | El API externo falló, no respondió o agotó el timeout. |
| 500    | `INTERNAL_ERROR`     | Error inesperado no controlado. |

## Estructura

```
src/
├── app.js                Construye la app de Express (no levanta el server)
├── server.js             Punto de entrada
├── config/               Configuración con defaults; env vars opcionales
├── routes/               Definición de rutas
├── controllers/          Leen la request y responden
├── services/             Orquestación del flujo de negocio
├── clients/              Única capa que habla con el API externo
├── utils/                Funciones puras (parser de CSV, concurrencia)
├── errors/               AppError con status y código de negocio
└── middlewares/          Manejo de errores y rutas no encontradas
```

`app.js` está separado de `server.js` para que los tests de integración
puedan importar la app y ejercitarla con supertest sin abrir un puerto real.

## Decisiones de diseño

### Validación de líneas

El enunciado indica descartar las líneas que "no tengan la cantidad de datos
suficientes". La validación implementada es más estricta: además de exigir las
4 columnas, verifica que ninguna venga vacía, que `number` sea un número finito
y que `hex` tenga 32 dígitos hexadecimales.

La decisión se validó contra los datos reales del API externo. El archivo
`test6.csv` contiene filas con las 4 columnas presentes pero con la columna
`number` corrupta (`076124434o`, `39o`, `o`). Validando únicamente la cantidad
de columnas, esas filas se habrían incluido en la respuesta con `number: NaN`,
que `JSON.stringify` serializa como `null`. El resultado habría sido un endpoint
devolviendo datos inválidos como si fueran correctos.

Validar de más produce una respuesta correcta; validar de menos produce una
respuesta rota.

### Manejo de fallos por archivo

- Un archivo que se descarga pero cuyas líneas son todas inválidas **se incluye**
  en la respuesta con `lines: []`. Su existencia es un dato real.
- Un archivo que **falla al descargarse se omite** del resultado. El enunciado
  contempla explícitamente que esto ocurra, y una falla puntual no debe tumbar
  la respuesta completa.
- Si en cambio se pidió un archivo puntual con `?fileName=`, un fallo de descarga
  **sí se propaga** como `502`. Devolver un array vacío ocultaría el problema
  justo cuando el consumidor pidió ese archivo y ningún otro.

### Comportamiento observado con los datos reales

Al momento de escribir esto, el API externo expone 9 archivos:

| Archivo | Resultado |
|---------|-----------|
| `test2.csv`, `test3.csv`, `test9.csv` | Procesados: 15 líneas válidas en total. |
| `test1.csv`, `test6.csv`, `test15.csv`, `test18.csv` | Descargados sin líneas válidas; se devuelven con `lines: []`. |
| `test4.csv` | El API externo responde `500`; se omite de la respuesta. |
| `test5.csv` | El API externo responde `404` pese a figurar en `/secret/files`; se omite igual. |

### Resolución del 404

El endpoint `/secret/file/{name}` del API externo no documenta un `404`, por lo
que no permite distinguir "el archivo no existe" de "el servidor falló". Por eso
la existencia se valida contra `/secret/files` antes de intentar la descarga, lo
que hace que el `404` sea determinístico.

### Concurrencia limitada

Los archivos se descargan en paralelo con un tope de descargas simultáneas
(5 por defecto). Un `Promise.all` sin límite abriría tantas conexiones como
archivos haya; un bucle secuencial desperdiciaría tiempo esperando de a una.

### Descarga como texto plano

`/secret/file/{name}` es el único endpoint del Swagger cuya respuesta `200` no
declara un schema: devuelve CSV, no JSON. El cliente fuerza `responseType: 'text'`
y anula `transformResponse` para que axios no intente interpretar el contenido.

## Dependencias

| Paquete     | Uso |
|-------------|-----|
| `express`   | Framework HTTP (requerido por el enunciado). |
| `axios`     | Cliente HTTP. Se fija la versión `0.27` por compatibilidad con Node 14. |
| `mocha`     | Runner de tests (requerido por el enunciado). |
| `chai`      | Aserciones (requerido). Se fija la versión `4.x`: la `5.x` es solo ESM. |
| `nock`      | Intercepta las llamadas HTTP al API externo en los tests. |
| `supertest` | Ejercita los endpoints en los tests de integración. |
| `standard`  | Linter (punto opcional del enunciado). |

`nock` y `supertest` no figuran en el enunciado; se incorporaron porque testear
la API sin interceptar el API externo obligaría a depender de un servicio de
terceros durante la corrida de los tests.

## Tests

```bash
npm test
```

- `test/unit/` — funciones y módulos aislados, sin red.
- `test/integration/` — endpoints completos vía supertest, con el API externo
  interceptado por nock.
- `test/fixtures/` — datos de prueba compartidos.