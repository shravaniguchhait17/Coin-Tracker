package com.example.demo;

/** Request body for PUT /api/expenses/{month} — month is the path variable, not part of the body. */
public record ExpenseAmounts(
        double rent,
        double groceries,
        double travel,
        double food,
        double misc
) {
}
