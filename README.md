# TBX Challenge — Full Stack

Solución al code challenge de Toolbox: una API REST que consume archivos CSV
desde un API externo, los valida y reformatea, y un cliente web que muestra esa
información en pantalla.

## Estructura

```
.
├── api/                  API REST (Node.js 14 + Express)
├── web/                  Cliente web (React + React Bootstrap, Node.js 16)
├── docker-compose.yml    Orquestación de ambos servicios
└── README.md
```

Cada aplicación es un proyecto npm independiente, con sus propias dependencias
y su propia versión de Node, tal como lo pide el enunciado.

## Arranque rápido (Docker)

Requiere únicamente Docker y Docker Compose instalados.

```bash
docker compose up --build
```

| Servicio | URL                     |
|----------|-------------------------|
| API      | http://localhost:3000   |
| Web      | http://localhost:8080   |

Para verificar que la API responde:

```bash
curl -X GET "http://localhost:3000/files/data" -H "accept: application/json"
```

## Arranque sin Docker

En dos terminales separadas:

```bash
cd api && npm install && npm start     # requiere Node 14
cd web && npm install && npm start     # requiere Node 16
```

Las instrucciones detalladas de cada aplicación están en su propio README:

- [`api/README.md`](./api/README.md) — endpoints, contratos, decisiones de diseño
- [`web/README.md`](./web/README.md) — estructura, estado, decisiones de diseño

## Tests

```bash
cd api && npm test     # 47 tests (Mocha + Chai)
cd web && npm test     # 19 tests (Jest + Testing Library)
```

Ambos proyectos verifican además el estilo con StandardJS mediante `npm run lint`.

## Requisitos cubiertos

| Requisito | Estado |
|-----------|--------|
| API REST con Node.js 14 + Express | ✅ |
| Endpoint `GET /files/data` | ✅ |
| JavaScript ES6+ sin TypeScript ni transpiladores en la API | ✅ |
| Sin dependencias globales ni variables de entorno obligatorias | ✅ |
| Tests con Mocha + Chai (`npm test`) | ✅ |
| API iniciable con `npm start` | ✅ |
| Frontend React + React Bootstrap con Webpack | ✅ |
| Programación funcional y Hook Effects | ✅ |
| Pantalla acorde al wireframe | ✅ |

### Puntos opcionales

| Opcional | Estado |
|----------|--------|
| `GET /files/list` | ✅ |
| Filtro `GET /files/data?fileName=` | ✅ |
| StandardJS | ✅ |
| Redux en el frontend | ✅ |
| Tests unitarios con Jest en el frontend | ✅ |
| Filtro por `fileName` desde la interfaz | ✅ |
| Docker / Docker Compose | ✅ |

## Notas sobre el API externo

El servicio externo expone nueve archivos, varios de ellos deliberadamente
corruptos o inaccesibles. El detalle de cada caso y de cómo se resuelve está
documentado en [`api/README.md`](./api/README.md).