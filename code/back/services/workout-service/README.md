# workout-service

Responsabilidade: Registro de treinos (corrida/musculação).

- **Porta:** 8082
- **Banco:** workout_db (PostgreSQL)

## Como rodar isolado

```bash
# 1. Copie as variáveis de ambiente
cp .env.example .env

# 2. Suba apenas o postgres (necessário)
docker run -d \
  --name workout-postgres \
  -e POSTGRES_DB=workout_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# 3. Configure o DATABASE_URL no .env
# DATABASE_URL=jdbc:postgresql://localhost:5432/workout_db

# 4. Build e run via Maven
mvn spring-boot:run

# Ou via Docker
docker build -t workout-service .
docker run --env-file .env -p 8082:8082 workout-service
```

## Endpoints

| Método | Path    | Descrição    |
|--------|---------|--------------|
| GET    | /health | Health check |

## Verificar

```bash
curl http://localhost:8082/health
# {"service":"workout-service","status":"ok","timestamp":"..."}
```
