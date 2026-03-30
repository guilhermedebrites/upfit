# auth-service

Responsabilidade: Usuário, Perfil e autenticação JWT.

- **Porta:** 8081
- **Banco:** auth_db (PostgreSQL)

## Como rodar isolado

```bash
# 1. Copie as variáveis de ambiente
cp .env.example .env

# 2. Suba apenas o postgres (necessário)
docker run -d \
  --name auth-postgres \
  -e POSTGRES_DB=auth_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# 3. Configure o DATABASE_URL no .env
# DATABASE_URL=jdbc:postgresql://localhost:5432/auth_db

# 4. Build e run via Maven
mvn spring-boot:run

# Ou via Docker
docker build -t auth-service .
docker run --env-file .env -p 8081:8081 auth-service
```

## Endpoints

| Método | Path      | Descrição        |
|--------|-----------|------------------|
| GET    | /health   | Health check     |

## Verificar

```bash
curl http://localhost:8081/health
# {"service":"auth-service","status":"ok","timestamp":"..."}
```
