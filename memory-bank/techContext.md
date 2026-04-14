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
| Storage assets | S3 (profile-assets, group-assets, challenge-assets) |
| Storage config | S3 (upfit-config) |
| Monitoramento | Amazon CloudWatch |

## Buckets S3

| Bucket | Finalidade | Quem acessa |
|--------|-----------|-------------|
| `profile-assets` | Fotos de perfil dos usuários | auth-service (escrita URL), cliente (upload direto) |
| `group-assets` | Imagens dos grupos | group-service (escrita URL), cliente (upload direto) |
| `challenge-assets` | Capas dos desafios | challenge-service (escrita URL), cliente (upload direto) |
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
| API Gateway | Nginx (porta 8080) — substituto local do API Gateway AWS |
| SQS/SNS/S3 | LocalStack |
| PostgreSQL | Docker (postgres:15) |
| Serviços | Docker Compose |

> **Nginx como API Gateway local:** roteia cada path para o serviço correspondente na rede interna Docker. O app mobile usa `http://localhost:8080` como URL base em dev — os paths dos endpoints não mudam entre dev e produção.
> Em produção, o Nginx é substituído pelo **AWS API Gateway**, mantendo os mesmos paths.
> Configuração em `infra/nginx/nginx.conf`.
>
> **Roteamento Nginx:**
> ```
> /auth/**           → auth-service:8081
> /profile/**        → auth-service:8081
> /workouts/**       → workout-service:8082
> /progression/**    → progression-service:8083
> /achievements/**   → progression-service:8083
> /groups/**         → group-service:8084
> /challenges/**     → challenge-service:8085
> /notifications/**  → notification-service:8086
> ```
>
> Os buckets `profile-assets`, `group-assets`, `challenge-assets` e `upfit-config` devem ser criados no LocalStack via `infra/localstack/setup.sh`, junto com os arquivos JSON de thresholds iniciais.

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
POST /auth/register                      → cria usuário
POST /auth/login                         → retorna JWT + refreshToken
POST /auth/refresh                       → renova JWT via refreshToken
GET  /profile/:userId                    → retorna perfil do usuário
PUT  /profile/:userId                    → atualiza perfil (bio, peso, altura, objetivo, foto)
GET  /profile/upload-url?filename=...    → gera presigned URL para upload no S3 (profile-assets) — JWT obrigatório — válida 5 min
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
POST   /groups                           → cria grupo (userId vira OWNER automaticamente)
PUT    /groups/:id                       → edita grupo — somente OWNER do grupo ou ADMIN da plataforma
POST   /groups/:id/join                  → entra no grupo
DELETE /groups/:id/leave                 → sai do grupo (OWNER não pode sair)
GET    /groups/upload-url?filename=...   → gera presigned URL para upload no S3 (group-assets) — JWT obrigatório — válida 5 min
GET    /groups                           → lista todos os grupos
GET    /groups/my                        → grupos que o usuário autenticado participa (userId extraído do JWT)
GET    /groups/:id                       → detalhes do grupo (nome, nível, XP, progresso para próximo nível)
GET    /groups/:id/members               → lista de membros com groupScore e role
GET    /groups/:id/ranking               → membros ordenados por groupScore DESC
GET    /groups/:id/feed                  → 10 treinos mais recentes dos membros (ORDER BY recordedAt DESC LIMIT 10)
GET    /health
```
> **Restrição de OWNER:** um usuário só pode ser OWNER de um grupo por vez. Validado no `POST /groups` antes de criar.
> **Feed:** populado via `GroupFeedEntry` salva pelo `GroupQueueListener` ao processar `WorkoutRecorded`.

### challenge-service (:8085)
```
POST   /challenges                          → cria desafio (ADMIN — type, requiredLevel, coverImageUrl)
GET    /challenges                          → lista desafios ativos (query params opcionais abaixo)
GET    /challenges/:id                      → detalhes + myParticipation embutido { currentProgress, completed, progressPercent }
POST   /challenges/:id/join                 → participa do desafio (valida requiredLevel contra userLevel do body)
DELETE /challenges/:id/leave                → desiste do desafio (somente se completed = false)
GET    /challenges/upload-url?filename=...  → presigned URL para capa no S3 (challenge-assets) — ADMIN — válida 5 min
GET    /health
```
> **Query params de GET /challenges:**
> - `?type=GLOBAL|DAILY|WEEKLY` — filtra por tipo de desafio
> - `?participating=true` — retorna apenas desafios em que o usuário autenticado participa; inclui `myParticipation` embutido `{ currentProgress, completed, progressPercent }` em cada item
> - `?participating=false` — retorna apenas desafios que o usuário NÃO participa; `myParticipation` omitido/null
> - Sem `participating`: retorna todos os desafios ativos
> - Os dois params podem ser combinados: `?type=GLOBAL&participating=true`
>
> **Expiração automática:** `@Scheduled` diário busca desafios com `endDate < hoje` e `status = ACTIVE` e os marca como `EXPIRED`.
> **Restrição de nível:** `requiredLevel = null` significa sem restrição. Se definido, usuário precisa ter `level >= requiredLevel` para participar.
> **myParticipation:** incluído na resposta do `GET /challenges/:id`. Se o usuário não participa, retorna `null`. No `GET /challenges`, incluído apenas quando `participating=true`.

### notification-service (:8086)
```
GET   /notifications/:userId           → lista notificações não lidas do usuário (padrão)
GET   /notifications/:userId?all=true  → lista todas as notificações (histórico completo)
PATCH /notifications/:id/read          → marca uma notificação como lida
PATCH /notifications/read-all          → marca todas as notificações do usuário como lidas
GET   /health
```
> Todos os endpoints protegidos por JWT.
> Usuário só pode acessar suas próprias notificações — `userId` do path validado contra `userId` do token (403 se diferente).

### Endpoints protegidos por role ADMIN
```
POST /challenges                    → somente ADMIN pode criar desafios
POST /achievements/definitions      → somente ADMIN pode cadastrar definições de conquistas
GET  /challenges/upload-url         → somente ADMIN pode gerar presigned URL para challenge-assets
```
> O role é extraído do JWT — sem chamada ao auth-service nos demais serviços.

### Fluxo de upload de imagens (presigned URL)
```
1. Frontend chama GET /profile/upload-url?filename=foto.jpg  (ou /groups/upload-url, /challenges/upload-url)
2. Backend gera presigned URL via S3Presigner (AWS SDK v2) — válida 5 minutos
3. Response: { "presignedUrl": "...", "objectUrl": "..." }
4. Frontend faz PUT direto no S3 usando presignedUrl
5. Frontend persiste objectUrl via PUT /profile/:userId, POST /groups ou POST /challenges
```
> objectUrl = presignedUrl sem query string (parâmetros de assinatura).
> Em dev local, a URL referencia http://localstack:4566 — substituir por http://localhost:4566 para testar no Postman/browser.
> S3Presigner precisa de pathStyleAccessEnabled(true) para funcionar com LocalStack.

### Endpoints protegidos por role ADMIN — lista completa
```
POST  /challenges                              → challenge-service
GET   /challenges/upload-url                   → challenge-service
POST  /achievements/definitions                → progression-service
PATCH /achievements/definitions/:id/toggle    → progression-service
```
