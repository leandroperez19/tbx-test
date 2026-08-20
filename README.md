# TBX Challenge — Full Stack

Solución al code challenge de Toolbox: una API REST que consume archivos CSV
desde un API externo, los valida y reformatea, y un cliente web que muestra
esa información en pantalla.

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

Las instrucciones detalladas de cada aplicación están en su propio README:

- [`api/README.md`](./api/README.md) — endpoints, contratos, decisiones de diseño
- [`web/README.md`](./web/README.md) — build, estructura de componentes

## Requisitos cubiertos

| Requisito | Estado |
|-----------|--------|
| API REST con Node.js 14 + Express | ✅ |
| Endpoint `GET /files/data` | ✅ |
| JavaScript ES6+ sin TypeScript ni transpiladores | ✅ |
| Sin dependencias globales ni variables de entorno obligatorias | ✅ |
| Tests con Mocha + Chai (`npm test`) | ✅ |
| Frontend React + React Bootstrap con Webpack | ⏳ |
| Programación funcional y Hooks | ⏳ |

### Puntos opcionales

| Opcional | Estado |
|----------|--------|
| `GET /files/list` | ✅ |
| Filtro `GET /files/data?fileName=` | ✅ |
| StandardJS | ✅ |
| Docker / Docker Compose | ✅ |
| Redux en el frontend | ⏳ |
| Tests unitarios con Jest en el frontend | ⏳ |
| Filtro por `fileName` desde la UI | ⏳ |