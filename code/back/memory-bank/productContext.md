# UpFit — Product Context

## Por que existe
Baixa adesão a exercícios é um problema global. O UpFit resolve isso tornando o treino viciante via mecânicas de jogo.

## Como funciona para o usuário
1. Usuário registra treino (corrida ou musculação)
2. Ganha XP baseado em distância ou volume
3. Sobe de nível, desbloqueia conquistas
4. Participa de grupos e desafios com amigos
5. Recebe notificações de progresso e marcos

## Tipos de Treino
- **Corrida:** registra distância (km) e pace médio
- **Musculação:** registra grupo muscular + exercícios (séries × reps × carga)

## Sistema de Gamificação
| Mecânica | Regra |
|----------|-------|
| XP - Corrida | proporcional à distância em km, também leva em conta o pace médio |
| XP - Musculação | proporcional ao volume total (séries × reps × carga) |
| Nível | `level = f(xpTotal)` — função a definir |
| Streak | +1 por dia com treino registrado |
| Conquistas | disparadas por regras (consistência, volume, velocidade, etc.) |

## Fluxo Principal (Workout Flow)
```
User → POST /workouts
  → workout-service salva treino no DB
  → publica evento WorkoutRecorded no SNS
    → SQS ProgressionQueue → progression-service (adiciona XP)
    → SQS ChallengeQueue  → challenge-service (atualiza progresso)
    → SQS GroupQueue      → group-service (atualiza pontuação no grupo)
    → SQS NotificationQueue → notification-service (notifica usuário)
```

## Níveis de Experiência
- INICIANTE
- INTERMEDIARIO
- AVANCADO

## Tipos de Notificação
- TREINO
- LEVEL_UP
- CONQUISTA
- DESAFIO
- GRUPO
