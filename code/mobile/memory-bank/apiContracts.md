# UpFit Frontend — API Contracts Reference

## Auth

### POST /auth/register
Cria usuário e perfil.

### POST /auth/login
Retorna JWT + refreshToken.

### POST /auth/refresh
Renova JWT.

## Profile

### GET /profile/:userId
Retorna perfil do usuário.

### PUT /profile/:userId
Atualiza bio, peso, altura, objetivo, foto.

### GET /profile/upload-url?filename=...
Retorna presigned URL para upload de foto no bucket `profile-assets`.

## Workouts

### POST /workouts
Registra treino.
- RunningWorkout
- StrengthWorkout

### GET /workouts/user/:id
Lista treinos do usuário autenticado.

## Progression

### GET /progression/:userId
Retorna:
- XP
- nível
- streak
- conquistas

### POST /achievements/definitions
ADMIN only.

### GET /achievements/definitions
Lista definições de conquistas.

### PATCH /achievements/definitions/:id/toggle
ADMIN only.

## Groups

### POST /groups
Cria grupo.

### PUT /groups/:id
Atualiza grupo. OWNER do grupo ou ADMIN.

### POST /groups/:id/join
Entrar no grupo.

### DELETE /groups/:id/leave
Sair do grupo.

### GET /groups/upload-url?filename=...
Presigned URL para imagem do grupo.

### GET /groups
Lista todos os grupos.

### GET /groups/my
Lista grupos do usuário autenticado.

### GET /groups/:id
Detalhes do grupo:
- nome
- nível
- XP
- progresso para próximo nível

### GET /groups/:id/members
Lista membros do grupo.

### GET /groups/:id/ranking
Lista membros ordenados por score.

### GET /groups/:id/feed
Lista 10 treinos mais recentes do grupo.

## Challenges

### POST /challenges
ADMIN only.

### GET /challenges
Filtros:
- type=GLOBAL|DAILY|WEEKLY
- participating=true|false

### GET /challenges/:id
Detalhe com myParticipation embutido.

### POST /challenges/:id/join
Participa no desafio.

### DELETE /challenges/:id/leave
Sai do desafio se não concluído.

### GET /challenges/upload-url?filename=...
Presigned URL da capa. ADMIN only.

## Notifications

### GET /notifications/:userId
Notificações não lidas.

### GET /notifications/:userId?all=true
Histórico completo.

### PATCH /notifications/:id/read
Marca uma como lida.

### PATCH /notifications/read-all
Marca todas como lidas.
