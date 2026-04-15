#!/bin/bash
set -e

echo "========================================================"
echo "[localstack] Iniciando setup de infraestrutura UpFit"
echo "========================================================"

# ─────────────────────────────────────────────────────────────────────────
# SQS — Filas
# ─────────────────────────────────────────────────────────────────────────
echo ""
echo "[localstack] Criando filas SQS..."

awslocal sqs create-queue --queue-name ProgressionQueue
awslocal sqs create-queue --queue-name ChallengeQueue
awslocal sqs create-queue --queue-name GroupQueue
awslocal sqs create-queue --queue-name NotificationQueue

# Obtém ARNs das filas
PROGRESSION_ARN=$(awslocal sqs get-queue-attributes \
  --queue-url http://localhost:4566/000000000000/ProgressionQueue \
  --attribute-names QueueArn --query Attributes.QueueArn --output text)

CHALLENGE_ARN=$(awslocal sqs get-queue-attributes \
  --queue-url http://localhost:4566/000000000000/ChallengeQueue \
  --attribute-names QueueArn --query Attributes.QueueArn --output text)

GROUP_ARN=$(awslocal sqs get-queue-attributes \
  --queue-url http://localhost:4566/000000000000/GroupQueue \
  --attribute-names QueueArn --query Attributes.QueueArn --output text)

NOTIFICATION_ARN=$(awslocal sqs get-queue-attributes \
  --queue-url http://localhost:4566/000000000000/NotificationQueue \
  --attribute-names QueueArn --query Attributes.QueueArn --output text)

# ─────────────────────────────────────────────────────────────────────────
# SNS — WorkoutRecordedTopic
# Subscribers: ProgressionQueue, ChallengeQueue, GroupQueue
# (NotificationQueue NÃO está aqui — recebe via NotificationTopic)
# ─────────────────────────────────────────────────────────────────────────
echo ""
echo "[localstack] Criando tópico SNS WorkoutRecordedTopic..."

WORKOUT_TOPIC_ARN=$(awslocal sns create-topic \
  --name WorkoutRecordedTopic \
  --query TopicArn --output text)
echo "[localstack] WorkoutRecordedTopic ARN: $WORKOUT_TOPIC_ARN"

echo "[localstack] Inscrevendo ProgressionQueue, ChallengeQueue, GroupQueue..."
awslocal sns subscribe --topic-arn "$WORKOUT_TOPIC_ARN" --protocol sqs --notification-endpoint "$PROGRESSION_ARN"
awslocal sns subscribe --topic-arn "$WORKOUT_TOPIC_ARN" --protocol sqs --notification-endpoint "$CHALLENGE_ARN"
awslocal sns subscribe --topic-arn "$WORKOUT_TOPIC_ARN" --protocol sqs --notification-endpoint "$GROUP_ARN"

# ─────────────────────────────────────────────────────────────────────────
# SNS — NotificationTopic
# Subscribers: NotificationQueue apenas
# Publicadores: progression-service, challenge-service, group-service
# ─────────────────────────────────────────────────────────────────────────
echo ""
echo "[localstack] Criando tópico SNS NotificationTopic..."

NOTIFICATION_TOPIC_ARN=$(awslocal sns create-topic \
  --name NotificationTopic \
  --query TopicArn --output text)
echo "[localstack] NotificationTopic ARN: $NOTIFICATION_TOPIC_ARN"

echo "[localstack] Inscrevendo NotificationQueue no NotificationTopic..."
awslocal sns subscribe --topic-arn "$NOTIFICATION_TOPIC_ARN" --protocol sqs --notification-endpoint "$NOTIFICATION_ARN"

# ─────────────────────────────────────────────────────────────────────────
# S3 — Buckets
# ─────────────────────────────────────────────────────────────────────────
echo ""
echo "[localstack] Criando buckets S3..."

awslocal s3 mb s3://profile-assets
awslocal s3 mb s3://group-assets
awslocal s3 mb s3://challenge-assets
awslocal s3 mb s3://upfit-config

# ─────────────────────────────────────────────────────────────────────────
# S3 — user-level-thresholds.json
# Usado pelo progression-service para calcular nível do usuário
# ─────────────────────────────────────────────────────────────────────────
echo ""
echo "[localstack] Fazendo upload de user-level-thresholds.json..."

cat > /tmp/user-level-thresholds.json << 'EOF'
{
  "thresholds": [
    { "level": 1,  "xpRequired": 0     },
    { "level": 2,  "xpRequired": 100   },
    { "level": 3,  "xpRequired": 250   },
    { "level": 4,  "xpRequired": 500   },
    { "level": 5,  "xpRequired": 900   },
    { "level": 6,  "xpRequired": 1400  },
    { "level": 7,  "xpRequired": 2000  },
    { "level": 8,  "xpRequired": 2800  },
    { "level": 9,  "xpRequired": 3800  },
    { "level": 10, "xpRequired": 5000  }
  ]
}
EOF

awslocal s3 cp /tmp/user-level-thresholds.json s3://upfit-config/user-level-thresholds.json

# ─────────────────────────────────────────────────────────────────────────
# S3 — group-level-thresholds.json
# Usado pelo group-service para calcular nível do grupo
# XP do grupo é acumulado coletivamente — thresholds maiores
# ─────────────────────────────────────────────────────────────────────────
echo ""
echo "[localstack] Fazendo upload de group-level-thresholds.json..."

cat > /tmp/group-level-thresholds.json << 'EOF'
{
  "thresholds": [
    { "level": 1,  "groupXpRequired": 0      },
    { "level": 2,  "groupXpRequired": 500    },
    { "level": 3,  "groupXpRequired": 1200   },
    { "level": 4,  "groupXpRequired": 2500   },
    { "level": 5,  "groupXpRequired": 4500   },
    { "level": 6,  "groupXpRequired": 7000   },
    { "level": 7,  "groupXpRequired": 10000  },
    { "level": 8,  "groupXpRequired": 14000  },
    { "level": 9,  "groupXpRequired": 19000  },
    { "level": 10, "groupXpRequired": 25000  }
  ]
}
EOF

awslocal s3 cp /tmp/group-level-thresholds.json s3://upfit-config/group-level-thresholds.json

# ─────────────────────────────────────────────────────────────────────────
# Resumo
# ─────────────────────────────────────────────────────────────────────────
echo ""
echo "========================================================"
echo "[localstack] Setup concluído com sucesso."
echo "========================================================"
echo ""
echo "Filas SQS:"
awslocal sqs list-queues
echo ""
echo "Tópicos SNS:"
awslocal sns list-topics
echo ""
echo "Buckets S3:"
awslocal s3 ls
echo ""
echo "Arquivos em upfit-config:"
awslocal s3 ls s3://upfit-config/
