# UpFit — Tech Context

## Infraestrutura AWS (Produção)

| Componente | Serviço AWS |
|-----------|-------------|
| Hospedagem frontend | AWS Amplify Hosting |
| DNS | Route 53 (upfit.com.br, api.upfit.com.br) |
| Entry point API | API Gateway |
| Compute | EC2 (todos os serviços via Docker) |
| Banco de dados | Amazon RDS (PostgreSQL) — 1 instância, múltiplos DBs |
| Mensageria publish | SNS — `WorkoutRecordedTopic` | workout-service publica treinos |
| Mensageria publish | SNS — `NotificationTopic` | progression, challenge, group publicam eventos de notificação |
| Mensageria consume | SQS (por serviço) | ProgressionQueue, ChallengeQueue, GroupQueue, NotificationQueue |
| Storage assets | S3 (profile-assets, group-assets) |
| Storage config | S3 (upfit-config) |
| Monitoramento | Amazon CloudWatch |

## Buckets S3

| Bucket | Finalidade | Quem acessa |
|--------|-----------|-------------|
| `profile-assets` | Fotos de perfil dos usuários | auth-service (escrita URL), cliente (upload direto) |
| `group-assets` | Imagens dos grupos | group-service (escrita URL), cliente (upload direto) |
| `upfit-config` | Arquivos de configuração de negócio | progression-service, group-service (leitura no startup) |

### Arquivos em `upfit-config`
```
user-level-thresholds.json   → thresholds de nível do usuário (lido por progression-service)
group-level-thresholds.json  → thresholds de nível do grupo (lido por group-service)
```
Formato:
```json
[
  { "level": 1, "xpRequired": 0 },
  { "level": 2, "xpRequired": 100 },
  { "level": 3, "xpRequired": 250 }
]
```
> Thresholds de grupo devem ter valores significativamente maiores — o grupo acumula XP de múltiplos membros simultaneamente.

## Stack de Desenvolvimento

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Linguagem | Java | 21 |
| Framework | Spring Boot | 3.x |
| ORM | Spring Data JPA (Hibernate) | — |
| Build | Maven | 3.x |
| Container base | eclipse-temurin | 21-jre-alpine |
| Banco local | PostgreSQL (Docker) | 15 |
| Mensageria local | LocalStack | latest |
| AWS SDK | software.amazon.awssdk | 2.x |

### Dependências Spring Boot padrão por serviço
```xml
spring-boot-starter-web
spring-boot-starter-data-jpa
spring-boot-starter-validation
postgresql (driver)
software.amazon.awssdk:sqs
software.amazon.awssdk:sns
software.amazon.awssdk:s3
lombok
```

## Infraestrutura Local (Desenvolvimento)

| Componente | Solução Local |
|-----------|--------------|
| SQS/SNS/S3 | LocalStack |
| PostgreSQL | Docker (postgres:15) |
| Serviços | Docker Compose |

> Os buckets `profile-assets`, `group-assets` e `upfit-config` devem ser criados no LocalStack via `infra/localstack/setup.sh`, junto com os arquivos JSON de thresholds iniciais.

## Convenções de Nomenclatura

| Elemento | Padrão | Exemplo |
|---------|--------|---------|
| Serviços | kebab-case | auth-service |
| Classes | PascalCase | WorkoutService |
| Variáveis | camelCase | userId |
| Eventos | PascalCase | WorkoutRecorded |
| Filas | PascalCase + Queue | ProgressionQueue |
| Bancos | snake_case | auth_db |
| Branches | kebab-case | feat/workout-service |

## Contratos de API

### auth-service (:8081)
```
POST /auth/register          → cria usuário
POST /auth/login             → retorna JWT + refreshToken
POST /auth/refresh           → renova JWT via refreshToken
GET  /profile/:userId        → retorna perfil do usuário
PUT  /profile/:userId        → atualiza perfil (bio, peso, altura, objetivo, foto)
GET  /health
```

### workout-service (:8082)
```
POST /workouts              → registra treino
GET  /workouts/user/:id     → lista treinos do usuário
GET  /health
```

### progression-service (:8083)
```
GET   /progression/:userId                      → retorna XP, nível, streak, conquistas
POST  /achievements/definitions                 → cria definição de conquista (ADMIN only)
GET   /achievements/definitions                 → lista todas as definições
PATCH /achievements/definitions/:id/toggle      → ativa/desativa definição (ADMIN only)
GET   /health
```

### group-service (:8084)
```
POST   /groups              → cria grupo
PUT    /groups/:id          → edita grupo (nome, descrição, meta)
POST   /groups/:id/join     → entra no grupo
DELETE /groups/:id/leave    → sai do grupo
GET    /health
```

### challenge-service (:8085)
```
POST /challenges       → cria desafio
POST /challenges/join  → participa de desafio
GET  /health
```

### notification-service (:8086)
```
GET /notifications/:userId  → lista notificações
GET /health
```

### Endpoints protegidos por role ADMIN
```
POST /challenges                    → somente ADMIN pode criar desafios
POST /achievements/definitions      → somente ADMIN pode cadastrar definições de conquistas
```
> O role é extraído do JWT — sem chamada ao auth-service nos demais serviços.

### Endpoints protegidos por role ADMIN — lista completa
```
POST  /challenges                              → challenge-service
POST  /achievements/definitions                → progression-service
PATCH /achievements/definitions/:id/toggle    → progression-service
```
