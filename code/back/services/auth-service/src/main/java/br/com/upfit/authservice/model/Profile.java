package br.com.upfit.authservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId;

    private String photoUrl;

    private String bio;

    private Double weight;

    private Double height;

    private String goal;

    @Enumerated(EnumType.STRING)
    private ExperienceLevel experienceLevel;
}
