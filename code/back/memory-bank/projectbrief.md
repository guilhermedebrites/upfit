# UpFit — Project Brief

## O que é o UpFit
Plataforma fitness gamificada focada em corrida e musculação.

**Objetivo:** aumentar adesão à atividade física via gamificação e sistemas sociais.

**Pilares:** Workouts · Progressão (XP) · Social (Grupos) · Desafios · Notificações

---

## Fase Atual: Fase 2 — Auth Service (Core)
Implementar autenticação completa como pré-requisito para todos os demais domínios.

**Critério de sucesso desta fase:**
- `POST /auth/register` → cria User + Profile no banco
- `POST /auth/login` → retorna JWT + refreshToken válidos
- `POST /auth/refresh` → renova JWT via refreshToken
- `GET /profile/:userId` e `PUT /profile/:userId` funcionando
- Fluxo validado: register → login → token válido

## Fases Concluídas
- ✅ **Fase 1 — Hello World + Pipeline de Eventos** (17/03/2026)
  - 6 serviços rodando via docker-compose
  - Pipeline end-to-end validado: POST /workouts → evento chega em progression-service

---

## Visão de Deploy (Cloud)
- **Uma única instância EC2** rodando todos os microserviços via Docker
- Não usar ECS/Fargate na fase atual — manter simples
- AWS gerenciados reais: RDS (PostgreSQL), SQS, SNS, S3
- API Gateway na frente da EC2
- DNS via Route 53: `upfit.com.br` e `api.upfit.com.br`
- Monitoramento: CloudWatch
