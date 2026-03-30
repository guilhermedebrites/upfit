# group-service

Responsabilidade: Grupos e membros.

- **Porta:** 8084
- **Banco:** group_db (PostgreSQL)

## Como rodar isolado

```bash
cp .env.example .env

docker run -d \
  --name group-postgres \
  -e POSTGRES_DB=group_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

mvn spring-boot:run

# Ou via Docker
docker build -t group-service .
docker run --env-file .env -p 8084:8084 group-service
```

## Endpoints

| Método | Path    | Descrição    |
|--------|---------|--------------|
| GET    | /health | Health check |

## Verificar

```bash
curl http://localhost:8084/health
# {"service":"group-service","status":"ok","timestamp":"..."}
```
