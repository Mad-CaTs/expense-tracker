package com.expenses.controller;

import com.expenses.dto.BudgetDTO;
import com.expenses.entity.User;
import com.expenses.repository.UserRepository;
import com.expenses.security.AuthenticatedUserResolver;
import com.expenses.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final AuthenticatedUserResolver userResolver;
    private final UserRepository userRepository;

    @GetMapping
    public List<BudgetDTO> getByPeriod(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        int m = month != null ? month : LocalDate.now().getMonthValue();
        int y = year  != null ? year  : LocalDate.now().getYear();
        return budgetService.findByPeriod(m, y, userResolver.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetDTO save(@Valid @RequestBody BudgetDTO dto) {
        Long userId = userResolver.getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow();
        return budgetService.save(dto, userId, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        budgetService.delete(id, userResolver.getCurrentUserId());
    }
}
