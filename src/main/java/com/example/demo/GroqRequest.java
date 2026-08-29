package com.example.demo;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/** Matches POST https://api.groq.com/openai/v1/chat/completions — never exposed outside this package. */
record GroqRequest(
    String model,
    List<ChatMessage> messages,
    @JsonProperty("max_completion_tokens") int maxCompletionTokens
) {
}
