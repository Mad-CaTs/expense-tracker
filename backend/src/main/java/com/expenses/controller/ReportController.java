package com.expenses.controller;

import com.expenses.dto.CategoryBreakdownDTO;
import com.expenses.dto.ReportSummaryDTO;
import com.expenses.security.AuthenticatedUserResolver;
import com.expenses.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping("/summary")
    public ReportSummaryDTO getSummary(
            @RequestParam(defaultValue = "MONTHLY") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate dateFrom = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate dateTo = to != null ? to : LocalDate.now();
        return reportService.getSummary(period, dateFrom, dateTo, userResolver.getCurrentUserId());
    }

    @GetMapping("/by-category")
    public List<CategoryBreakdownDTO> getCategoryBreakdown(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate dateFrom = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate dateTo = to != null ? to : LocalDate.now();
        return reportService.getCategoryBreakdown(dateFrom, dateTo, userResolver.getCurrentUserId());
    }
}
