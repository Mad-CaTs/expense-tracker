package com.expenses.controller;

import com.expenses.dto.RecurringExpenseDTO;
import com.expenses.entity.User;
import com.expenses.repository.UserRepository;
import com.expenses.security.AuthenticatedUserResolver;
import com.expenses.service.RecurringExpenseService;
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
    private final UserRepository userRepository;

    @GetMapping
    public List<RecurringExpenseDTO> getAll() {
        return recurringService.findAll(userResolver.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecurringExpenseDTO create(@Valid @RequestBody RecurringExpenseDTO dto) {
        Long userId = userResolver.getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow();
        return recurringService.create(dto, userId, user);
    }

    @PatchMapping("/{id}/toggle")
    public RecurringExpenseDTO toggle(@PathVariable Long id) {
        return recurringService.toggleActive(id, userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        recurringService.delete(id, userResolver.getCurrentUserId());
    }
}
