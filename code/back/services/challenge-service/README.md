# challenge-service

Responsabilidade: Desafios e participações.

- **Porta:** 8085
- **Banco:** challenge_db (PostgreSQL)

## Como rodar isolado

```bash
cp .env.example .env

docker run -d \
  --name challenge-postgres \
  -e POSTGRES_DB=challenge_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

mvn spring-boot:run

# Ou via Docker
docker build -t challenge-service .
docker run --env-file .env -p 8085:8085 challenge-service
```

## Endpoints

| Método | Path    | Descrição    |
|--------|---------|--------------|
| GET    | /health | Health check |

## Verificar

```bash
curl http://localhost:8085/health
# {"service":"challenge-service","status":"ok","timestamp":"..."}
```
