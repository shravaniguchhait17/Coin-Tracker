package com.example.demo;

import java.util.List;

/** Body of POST /api/advisor/chat — the frontend resends the full conversation each turn. */
public record ChatRequest(List<ChatMessage> messages) {
}
