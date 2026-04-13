package br.com.upfit.groupservice.dto;

import br.com.upfit.groupservice.model.Group;

import java.time.LocalDateTime;
import java.util.UUID;

public record GroupResponse(
        UUID id,
        String name,
        String description,
        String imageUrl,
        LocalDateTime createdAt,
        String weeklyGoal,
        int groupXp,
        int groupLevel
) {
    public static GroupResponse from(Group g) {
        return new GroupResponse(
                g.getId(),
                g.getName(),
                g.getDescription(),
                g.getImageUrl(),
                g.getCreatedAt(),
                g.getWeeklyGoal(),
                g.getGroupXp(),
                g.getGroupLevel()
        );
    }
}
