package com.example.demo;

import jakarta.persistence.*;
import org.hibernate.annotations.Check;

/**
 * One saved month of category totals for one user.
 * The unique constraint on (userEmail, month) is what makes
 * "PUT /api/expenses/{month}" an upsert rather than always inserting.
 */
@Entity
@Table(
        name = "expense_entry",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_email", "month"})
)
@Check(constraints =
        "month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$' " +
                "AND substring(month from 1 for 4)::int BETWEEN 2000 AND 2100"
)
public class ExpenseEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    /** Stored as "YYYY-MM" to match what the frontend sends/sorts by. */
    @Column(nullable = false)
    private String month;

    private double rent;
    private double groceries;
    private double travel;
    private double food;
    private double misc;

    protected ExpenseEntry() {
        // required by JPA
    }

    public ExpenseEntry(String userEmail, String month) {
        this.userEmail = userEmail;
        this.month = month;
    }

    public Long getId() {
        return id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getMonth() {
        return month;
    }

    public double getRent() {
        return rent;
    }

    public void setRent(double rent) {
        this.rent = rent;
    }

    public double getGroceries() {
        return groceries;
    }

    public void setGroceries(double groceries) {
        this.groceries = groceries;
    }

    public double getTravel() {
        return travel;
    }

    public void setTravel(double travel) {
        this.travel = travel;
    }

    public double getFood() {
        return food;
    }

    public void setFood(double food) {
        this.food = food;
    }

    public double getMisc() {
        return misc;
    }

    public void setMisc(double misc) {
        this.misc = misc;
    }
}
