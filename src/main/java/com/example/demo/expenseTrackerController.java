package com.example.demo;

import com.example.demo.ExpenseAmounts;
import com.example.demo.ExpenseDto;
import com.example.demo.ExpenseEntry;
import com.example.demo.ExpenseEntryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/expenses")
public class expenseTrackerController {

    private static final Pattern MONTH_PATTERN = Pattern.compile("^\\d{4}-(0[1-9]|1[0-2])$");
    private static final int MIN_YEAR = 2000;
    private static final int MAX_YEAR = 2100;

    private final ExpenseEntryRepository repository;

    public expenseTrackerController(ExpenseEntryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ExpenseDto> getExpenses(@AuthenticationPrincipal OAuth2User principal) {
        String email = currentUserEmail(principal);
        return repository.findByUserEmailOrderByMonthAsc(email)
                .stream()
                .map(ExpenseDto::from)
                .toList();
    }

    @PutMapping("/{month}")
    public ResponseEntity<ExpenseDto> saveExpense(
            @AuthenticationPrincipal OAuth2User principal,
            @PathVariable String month,
            @RequestBody ExpenseAmounts amounts
    ) {
        if (!isValidMonth(month)) {
            return ResponseEntity.badRequest().build();
        }

        String email = currentUserEmail(principal);
        ExpenseEntry entry = repository.findByUserEmailAndMonth(email, month)
                .orElseGet(() -> new ExpenseEntry(email, month));

        entry.setRent(amounts.rent());
        entry.setGroceries(amounts.groceries());
        entry.setTravel(amounts.travel());
        entry.setFood(amounts.food());
        entry.setMisc(amounts.misc());

        ExpenseEntry saved = repository.save(entry);
        return ResponseEntity.ok(ExpenseDto.from(saved));
    }

    private String currentUserEmail(OAuth2User principal) {
        return principal.getAttribute("email");
    }

    private boolean isValidMonth(String month) {
        if (!MONTH_PATTERN.matcher(month).matches()) {
            return false;
        }
        int year = Integer.parseInt(month.substring(0, 4));
        return year >= MIN_YEAR && year <= MAX_YEAR;
    }
}