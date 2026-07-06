package com.expenses.budget.internal;

import com.expenses.shared.security.AuthenticatedUserResolver;
import com.expenses.shared.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public List<BudgetResponse> getAll(@RequestParam(required = false) Long walletId) {
        return budgetService.findAll(userResolver.getCurrentUserId(), walletId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetResponse save(@Valid @RequestBody BudgetRequest request) {
        User user = userResolver.getCurrentUser();
        return budgetService.save(request, user.getId(), user);
    }

    @PutMapping("/{id}")
    public BudgetResponse update(@PathVariable Long id, @Valid @RequestBody BudgetUpdateRequest request) {
        return budgetService.update(id, request.getAmount(), userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        budgetService.delete(id, userResolver.getCurrentUserId());
    }
}
