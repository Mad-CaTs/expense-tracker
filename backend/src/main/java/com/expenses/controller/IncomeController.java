package com.expenses.controller;

import com.expenses.dto.IncomeDTO;
import com.expenses.security.AuthenticatedUserResolver;
import com.expenses.service.IncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public Page<IncomeDTO> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long walletId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return incomeService.findAll(from, to, walletId, userResolver.getCurrentUserId(),
                PageRequest.of(page, size, Sort.by("date").descending()));
    }

    @GetMapping("/{id}")
    public IncomeDTO findById(@PathVariable Long id) {
        return incomeService.findById(id, userResolver.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncomeDTO create(@Valid @RequestBody IncomeDTO dto) {
        var user = userResolver.getCurrentUser();
        return incomeService.create(dto, user.getId(), user);
    }

    @PutMapping("/{id}")
    public IncomeDTO update(@PathVariable Long id, @Valid @RequestBody IncomeDTO dto) {
        return incomeService.update(id, dto, userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        incomeService.delete(id, userResolver.getCurrentUserId());
    }
}
