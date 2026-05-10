package com.expenses.controller;

import com.expenses.dto.ExpenseDTO;
import com.expenses.security.AuthenticatedUserResolver;
import com.expenses.service.ExcelExportService;
import com.expenses.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ExcelExportService excelExportService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public Page<ExpenseDTO> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = userResolver.getCurrentUserId();
        return expenseService.findAll(from, to, categoryId, userId,
                PageRequest.of(page, size, Sort.by("date").descending()));
    }

    @GetMapping("/{id}")
    public ExpenseDTO findById(@PathVariable Long id) {
        return expenseService.findById(id, userResolver.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseDTO create(@Valid @RequestBody ExpenseDTO dto) {
        var user = userResolver.getCurrentUser();
        return expenseService.create(dto, user.getId(), user);
    }

    @PutMapping("/{id}")
    public ExpenseDTO update(@PathVariable Long id, @Valid @RequestBody ExpenseDTO dto) {
        return expenseService.update(id, dto, userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        expenseService.delete(id, userResolver.getCurrentUserId());
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) throws IOException {
        Long userId = userResolver.getCurrentUserId();
        byte[] data = excelExportService.exportExpenses(from, to, userId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=gastos.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }
}
