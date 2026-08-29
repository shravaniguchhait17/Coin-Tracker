package com.example.demo;

/** One turn in the conversation — role is "user" or "assistant". */
public record ChatMessage(String role, String content) {
}
