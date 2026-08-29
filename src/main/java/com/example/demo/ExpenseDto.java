package com.example.demo;

/** Shape returned by GET /api/expenses and PUT /api/expenses/{month}. */
public record ExpenseDto(
        String month,
        double rent,
        double groceries,
        double travel,
        double food,
        double misc
) {
    static ExpenseDto from(ExpenseEntry entry) {
        return new ExpenseDto(
                entry.getMonth(),
                entry.getRent(),
                entry.getGroceries(),
                entry.getTravel(),
                entry.getFood(),
                entry.getMisc()
        );
    }
}
