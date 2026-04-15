# UpFit Frontend — Progress

## Fase 0 — Descoberta e Base ✅
- [x] Consolidar contexto do backend
- [x] Levantar endpoints disponíveis
- [x] Definir necessidade de memory bank específico para frontend
- [x] Criar primeira versão dos arquivos de memória do frontend
- [x] Definir stack mobile: Expo + Expo Router + NativeWind + Zustand + Axios
- [x] Definir stack web: Next.js + TailwindCSS + Zustand + Axios
- [x] Definir ordem: mobile primeiro, web depois

## Fase 1 — Estrutura do projeto mobile (ATUAL)
- [ ] Projeto Expo criado com TypeScript
- [ ] Expo Router configurado
- [ ] NativeWind configurado
- [ ] Axios configurado com base URL e interceptors JWT
- [ ] Zustand configurado
- [ ] Estrutura de pastas por feature criada
- [ ] Variáveis de ambiente configuradas (.env)
- [ ] Fluxo de autenticação base (login, register, refresh token, persistência)

## Fase 2 — Auth UI
- [ ] Tela de login
- [ ] Tela de cadastro
- [ ] Persistência de sessão (SecureStore)
- [ ] Refresh token automático via interceptor Axios
- [ ] Tela de perfil
- [ ] Upload de foto com presigned URL

## Fase 3 — Core UX
- [ ] Home/dashboard com XP, nível e streak
- [ ] Registro de treino de corrida
- [ ] Registro de treino de musculação
- [ ] Histórico de treinos
- [ ] Tela de progressão com conquistas

## Fase 4 — Social
- [ ] Listagem de grupos
- [ ] Criar grupo
- [ ] Entrar/sair de grupo
- [ ] Tela de detalhes do grupo
- [ ] Ranking
- [ ] Feed

## Fase 5 — Challenges
- [ ] Listagem de desafios (filtros por tipo e participação)
- [ ] Detalhe de desafio com progresso
- [ ] Participar/desistir
- [ ] Tela administrativa para criar desafio (ADMIN)

## Fase 6 — Notifications
- [ ] Lista de notificações
- [ ] Marcar como lida
- [ ] Marcar todas como lidas

## Fase 7 — Web (Next.js)
- [ ] A definir após mobile concluído

## Decisões Técnicas Registradas
| Data | Decisão | Motivo |
|------|---------|--------|
| 14/04 | Mobile first (Expo + Expo Router) | Experiência principal do usuário |
| 14/04 | NativeWind para estilização | Produtividade com Tailwind no mobile |
| 14/04 | Zustand para estado | Simples e leve para o escopo do projeto |
| 14/04 | Axios para HTTP | Facilidade com interceptors para JWT |
| 14/04 | Expo SecureStore para tokens | Armazenamento criptografado no device |
| 14/04 | URL base única por ambiente | Nginx local / API Gateway em produção |
| 14/04 | Web com Next.js (fase futura) | Dashboard / visão expandida após mobile |
| 14/04 | Telas implementadas conforme protótipos do dev | Fidelidade ao design definido |
