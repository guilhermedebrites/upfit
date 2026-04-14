package br.com.upfit.notificationservice.dto;

import br.com.upfit.notificationservice.model.Notification;
import br.com.upfit.notificationservice.model.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID userId,
        String title,
        String message,
        NotificationType type,
        Boolean read,
        LocalDateTime sentAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getUserId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getRead(),
                n.getSentAt()
        );
    }
}
