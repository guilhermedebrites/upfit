package br.com.upfit.notificationservice.controller;

import br.com.upfit.notificationservice.dto.NotificationResponse;
import br.com.upfit.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // GET /notifications/:userId          → não lidas (padrão)
    // GET /notifications/:userId?all=true → histórico completo
    @GetMapping("/{userId}")
    public List<NotificationResponse> getNotifications(@PathVariable UUID userId,
                                                       @RequestParam(required = false, defaultValue = "false") boolean all,
                                                       @AuthenticationPrincipal String userIdStr) {
        return notificationService.getNotifications(userId, UUID.fromString(userIdStr), all);
    }

    // PATCH /notifications/read-all — deve vir antes de /:id para não ser interceptado
    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllAsRead(@AuthenticationPrincipal String userIdStr) {
        notificationService.markAllAsRead(UUID.fromString(userIdStr));
    }

    // PATCH /notifications/:id/read
    @PatchMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable UUID id,
                                           @AuthenticationPrincipal String userIdStr) {
        return notificationService.markAsRead(id, UUID.fromString(userIdStr));
    }
}
