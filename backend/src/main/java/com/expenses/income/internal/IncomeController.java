package com.expenses.income.internal;

import com.expenses.shared.security.AuthenticatedUserResolver;
import com.expenses.shared.web.PageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Validated
@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public PageResponse<IncomeResponse> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long walletId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return PageResponse.from(incomeService.findAll(from, to, walletId, userResolver.getCurrentUserId(),
                PageRequest.of(page, size, Sort.by(Sort.Order.desc("date"), Sort.Order.desc("id")))));
    }

    @GetMapping("/{id}")
    public IncomeResponse findById(@PathVariable Long id) {
        return incomeService.findById(id, userResolver.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncomeResponse create(@Valid @RequestBody IncomeRequest request) {
        var user = userResolver.getCurrentUser();
        return incomeService.create(request, user.getId(), user);
    }

    @PutMapping("/{id}")
    public IncomeResponse update(@PathVariable Long id, @Valid @RequestBody IncomeRequest request) {
        return incomeService.update(id, request, userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        incomeService.delete(id, userResolver.getCurrentUserId());
    }
}
