package br.com.upfit.notificationservice.repository;

import br.com.upfit.notificationservice.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUserIdOrderBySentAtDesc(UUID userId);

    List<Notification> findByUserIdAndReadFalseOrderBySentAtDesc(UUID userId);

    List<Notification> findByUserIdAndReadFalse(UUID userId);
}
