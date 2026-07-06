package com.expenses.recurring.internal;

import com.expenses.shared.security.AuthenticatedUserResolver;
import com.expenses.shared.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
public class RecurringExpenseController {

    private final RecurringExpenseService recurringService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public List<RecurringExpenseResponse> getAll(@RequestParam(required = false) Long walletId) {
        return recurringService.findAll(userResolver.getCurrentUserId(), walletId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecurringExpenseResponse create(@Valid @RequestBody RecurringExpenseRequest request) {
        User user = userResolver.getCurrentUser();
        return recurringService.create(request, user.getId(), user);
    }

    @PatchMapping("/{id}/toggle")
    public RecurringExpenseResponse toggle(@PathVariable Long id) {
        return recurringService.toggleActive(id, userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        recurringService.delete(id, userResolver.getCurrentUserId());
    }
}
