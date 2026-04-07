# CLAUDE.md — UpFit Project Rules

## Stack — Decisão Tomada

```
Linguagem:    Java 21
Framework:    Spring Boot 3.x
ORM:          Spring Data JPA (Hibernate)
Build:        Maven
Container:    eclipse-temurin:21-jre-alpine
```

**Nunca sugira Node.js, Python ou outra linguagem para os microserviços.**

## Leia Sempre Primeiro
Ao iniciar qualquer sessão neste projeto, leia os arquivos na seguinte ordem:
1. `memory-bank/projectbrief.md`
2. `memory-bank/activeContext.md`
3. `memory-bank/systemPatterns.md`
4. `memory-bank/domainModel.md` ← ao trabalhar em qualquer entidade JPA

---

## Regras Gerais

### Nunca faça sem perguntar:
- Mudar a porta de um serviço
- Criar comunicação direta (HTTP) entre dois serviços
- Criar tabelas que um serviço não deveria possuir
- Adicionar dependências externas não listadas em techContext.md

### Sempre faça:
- Validar que cada serviço tem seu `GET /health`
- Usar variáveis de ambiente para toda configuração (sem hardcode)
- Manter cada serviço completamente isolado em sua pasta
- Nomear eventos em PascalCase, serviços em kebab-case
- Atualizar `memory-bank/activeContext.md` ao final de cada sessão

---

## Regras de Arquitetura

### Comunicação entre serviços
```
✅ CORRETO:   workout-service → SNS → SQS → progression-service
❌ ERRADO:    workout-service → HTTP → progression-service
```

### Banco de dados
```
✅ CORRETO:   auth-service lê apenas auth_db
❌ ERRADO:    auth-service faz query em workout_db
```

### Referências cross-service
```
✅ CORRETO:   progression-service armazena userId (string/UUID)
❌ ERRADO:    progression-service armazena objeto User completo
```

---

---

## Estrutura Obrigatória de cada Microserviço (Java/Spring Boot)

```
code/back/services/<nome-service>/
├── Dockerfile
├── .env.example
├── README.md
└── src/
    └── main/
        ├── java/br/com/upfit/<nomeservice>/
        │   ├── Application.java          ← @SpringBootApplication
        │   ├── controller/
        │   ├── service/
        │   ├── repository/
        │   ├── model/
        │   ├── dto/
        │   ├── config/                   ← SQS/SNS beans, Security
        │   └── messaging/               ← publishers e listeners
        └── resources/
            └── application.yml
pom.xml
```

## Dockerfile padrão (Java)

```dockerfile
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 808x
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## application.yml padrão

```yaml
server:
  port: ${PORT:808x}

spring:
  application:
    name: nome-service
  datasource:
    url: ${DATABASE_URL}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

aws:
  endpoint: ${AWS_ENDPOINT:}   # vazio em produção, http://localstack:4566 em dev
  region: ${AWS_REGION:us-east-1}
```



```
services/<nome-service>/
├── Dockerfile
├── .env.example          ← variáveis necessárias, sem valores reais
├── README.md             ← como rodar isolado
└── src/
    └── (código do serviço)
```

---

## Variáveis de Ambiente Padrão por Serviço

Cada serviço DEVE aceitar estas variáveis:
```
PORT=808x
SERVICE_NAME=<nome-service>
DATABASE_URL=postgresql://...
AWS_ENDPOINT=http://localstack:4566   # para dev local
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test                # LocalStack
AWS_SECRET_ACCESS_KEY=test            # LocalStack
```

---

## docker-compose.yml — Regras

- Todos os serviços dependem de `postgres` e `localstack`
- Usar `healthcheck` em postgres e localstack
- Serviços só sobem após dependências estarem healthy
- Usar `networks: [upfit-network]` em todos os containers

---

## Ao Encontrar Ambiguidade

Se uma tarefa puder ser interpretada de múltiplas formas:
1. Mostre as opções com prós e contras
2. Pergunte qual abordar
3. NÃO assuma e implemente

---

## Convenções de Nomenclatura — Banco de Dados

- Nomes de tabelas: **snake_case em inglês** → `users`, `group_memberships`, `exercise_entries`
- Nomes de colunas: **snake_case em inglês** → `created_at`, `password_hash`, `user_id`
- Nunca usar português em tabelas ou colunas

---

## Domínio de Dados — Referência Rápida

```
auth_db:       User, Profile
workout_db:    Workout, RunningWorkout, StrengthWorkout, ExerciseEntry
progression_db: Progression, Achievement
group_db:      Group, GroupMembership
challenge_db:  Challenge, ChallengeParticipation
```

## Eventos — Referência Rápida

```
WorkoutRecorded     → publicado por: workout-service
LevelUp             → publicado por: progression-service
AchievementUnlocked → publicado por: progression-service
ChallengeCompleted  → publicado por: challenge-service
```
