package br.com.upfit.authservice.controller;

import br.com.upfit.authservice.dto.PromoteRequest;
import br.com.upfit.authservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuthService authService;

    @PostMapping("/promote")
    public ResponseEntity<Void> promote(@Valid @RequestBody PromoteRequest request) {
        authService.promoteToAdmin(request.userId());
        return ResponseEntity.noContent().build();
    }
}
