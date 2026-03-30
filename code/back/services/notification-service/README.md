# notification-service

Responsabilidade: Notificações ao usuário.

- **Porta:** 8086
- **Banco:** nenhum (sem banco próprio nesta fase)

## Como rodar isolado

```bash
cp .env.example .env

mvn spring-boot:run

# Ou via Docker
docker build -t notification-service .
docker run --env-file .env -p 8086:8086 notification-service
```

## Endpoints

| Método | Path    | Descrição    |
|--------|---------|--------------|
| GET    | /health | Health check |

## Verificar

```bash
curl http://localhost:8086/health
# {"service":"notification-service","status":"ok","timestamp":"..."}
```
