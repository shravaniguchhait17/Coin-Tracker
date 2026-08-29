package com.example.demo;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class UserController {

    @GetMapping("/api/me")
    public Map<String, Object> me(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            throw new RuntimeException("Not authenticated");
        }

        Map<String, Object> attributes = principal.getAttributes();

        return Map.of(
                "name", attributes.get("name"),
                "email", attributes.get("email"),
                "picture", attributes.get("picture")
        );
    }
}
