# progression-service

Responsabilidade: XP, Nível, Streak e Conquistas.

- **Porta:** 8083
- **Banco:** progression_db (PostgreSQL)

## Como rodar isolado

```bash
# 1. Copie as variáveis de ambiente
cp .env.example .env

# 2. Suba apenas o postgres (necessário)
docker run -d \
  --name progression-postgres \
  -e POSTGRES_DB=progression_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# 3. Configure o DATABASE_URL no .env
# DATABASE_URL=jdbc:postgresql://localhost:5432/progression_db

# 4. Build e run via Maven
mvn spring-boot:run

# Ou via Docker
docker build -t progression-service .
docker run --env-file .env -p 8083:8083 progression-service
```

## Endpoints

| Método | Path    | Descrição    |
|--------|---------|--------------|
| GET    | /health | Health check |

## Verificar

```bash
curl http://localhost:8083/health
# {"service":"progression-service","status":"ok","timestamp":"..."}
```
