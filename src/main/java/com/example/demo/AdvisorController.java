package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/advisor")
public class AdvisorController {

    private final AdvisorService advisorService;

    public AdvisorController(AdvisorService advisorService) {
        this.advisorService = advisorService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
        @AuthenticationPrincipal OAuth2User principal,
        @RequestBody ChatRequest request
    ) {
        if (request.messages() == null || request.messages().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String email = principal.getAttribute("email");
        String reply = advisorService.reply(email, request.messages());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
