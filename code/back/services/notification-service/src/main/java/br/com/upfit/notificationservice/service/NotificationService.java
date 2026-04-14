package br.com.upfit.notificationservice.service;

import br.com.upfit.notificationservice.dto.NotificationEvent;
import br.com.upfit.notificationservice.dto.NotificationResponse;
import br.com.upfit.notificationservice.model.Notification;
import br.com.upfit.notificationservice.model.NotificationType;
import br.com.upfit.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ─── GET ─────────────────────────────────────────────────────────────────────

    public List<NotificationResponse> getNotifications(UUID userId, UUID tokenUserId, boolean all) {
        assertOwner(userId, tokenUserId);
        List<Notification> result = all
                ? notificationRepository.findByUserIdOrderBySentAtDesc(userId)
                : notificationRepository.findByUserIdAndReadFalseOrderBySentAtDesc(userId);
        return result.stream().map(NotificationResponse::from).toList();
    }

    // ─── MARK ONE AS READ ────────────────────────────────────────────────────────

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, UUID tokenUserId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        assertOwner(n.getUserId(), tokenUserId);
        n.setRead(true);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    // ─── MARK ALL AS READ ────────────────────────────────────────────────────────

    @Transactional
    public void markAllAsRead(UUID tokenUserId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(tokenUserId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        log.info("[notification-service] {} notificação(ões) marcadas como lidas para userId={}", unread.size(), tokenUserId);
    }

    // ─── PROCESS EVENT ───────────────────────────────────────────────────────────

    @Transactional
    public void processEvent(NotificationEvent event) {
        if (event.eventType() == null) {
            log.warn("[notification-service] Evento recebido sem eventType — ignorado");
            return;
        }

        switch (event.eventType()) {
            case "WorkoutRecorded"     -> persistUserNotification(event,
                    "Treino registrado!",
                    "Treino registrado! Continue assim.",
                    NotificationType.WORKOUT,
                    event.userId());

            case "LevelUp"             -> persistUserNotification(event,
                    "Subiu de nível!",
                    "Parabéns! Você subiu para o nível " + event.newLevel() + ".",
                    NotificationType.LEVEL_UP,
                    event.userId());

            case "AchievementUnlocked" -> persistUserNotification(event,
                    "Conquista desbloqueada!",
                    "Conquista desbloqueada: " + (event.title() != null ? event.title() : "nova conquista") + ".",
                    NotificationType.ACHIEVEMENT,
                    event.userId());

            case "ChallengeCompleted"  -> persistUserNotification(event,
                    "Desafio concluído!",
                    "Desafio concluído! Você ganhou " + (event.rewardXp() != null ? event.rewardXp() : "bônus de") + " XP.",
                    NotificationType.CHALLENGE,
                    event.userId());

            case "GroupLevelUp"        -> persistGroupNotification(event,
                    "Grupo subiu de nível!",
                    "Seu grupo subiu para o nível " + event.newLevel() + "!",
                    NotificationType.GROUP,
                    event.groupId());

            case "MemberJoined"        -> persistUserNotification(event,
                    "Novo membro no grupo!",
                    "Um novo membro entrou no grupo.",
                    NotificationType.GROUP,
                    event.userId());

            case "MemberLeft"          -> persistUserNotification(event,
                    "Membro saiu do grupo.",
                    "Um membro saiu do grupo.",
                    NotificationType.GROUP,
                    event.userId());

            default -> log.warn("[notification-service] eventType desconhecido: {}", event.eventType());
        }
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

    /**
     * Persiste notificação para um userId específico (campo userId do evento).
     */
    private void persistUserNotification(NotificationEvent event,
                                         String title, String message,
                                         NotificationType type,
                                         String rawUserId) {
        if (rawUserId == null) {
            log.warn("[notification-service] userId ausente no evento {} — notificação não persistida", event.eventType());
            return;
        }
        persist(UUID.fromString(rawUserId), title, message, type);
    }

    /**
     * Persiste notificação usando o groupId como referência de userId.
     * Usada para GroupLevelUp, onde não há userId específico na mensagem.
     * A notificação fica persistida mas não aparece em nenhuma lista de usuário.
     */
    private void persistGroupNotification(NotificationEvent event,
                                          String title, String message,
                                          NotificationType type,
                                          String rawGroupId) {
        if (rawGroupId == null) {
            log.warn("[notification-service] groupId ausente no evento {} — notificação não persistida", event.eventType());
            return;
        }
        persist(UUID.fromString(rawGroupId), title, message, type);
    }

    private void assertOwner(UUID resourceUserId, UUID tokenUserId) {
        if (!resourceUserId.equals(tokenUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Access denied: cannot access notifications of another user");
        }
    }

    private void persist(UUID userId, String title, String message, NotificationType type) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        notificationRepository.save(n);
        log.info("[notification-service] Notificação persistida para userId={} tipo={}", userId, type);
    }
}
