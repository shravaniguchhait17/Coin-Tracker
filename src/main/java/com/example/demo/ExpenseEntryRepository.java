package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseEntryRepository extends JpaRepository<ExpenseEntry, Long> {

    List<ExpenseEntry> findByUserEmailOrderByMonthAsc(String userEmail);

    Optional<ExpenseEntry> findByUserEmailAndMonth(String userEmail, String month);
}
