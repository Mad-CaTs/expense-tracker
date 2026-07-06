package com.expenses.report.internal;

import com.expenses.shared.security.AuthenticatedUserResolver;
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
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long categoryId) {
        LocalDate[] range = resolveRange(period, from, to);
        return reportService.getSummary(period, range[0], range[1], userResolver.getCurrentUserId(), categoryId);
    }

    @GetMapping("/by-category")
    public List<CategoryBreakdownDTO> getCategoryBreakdown(
            @RequestParam(defaultValue = "MONTHLY") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "EXPENSE") String txType,
            @RequestParam(required = false) Long walletId) {
        LocalDate[] range = resolveRange(period, from, to);
        return reportService.getCategoryBreakdown(range[0], range[1], userResolver.getCurrentUserId(), categoryId, txType, walletId);
    }

    private LocalDate[] resolveRange(String period, LocalDate from, LocalDate to) {
        LocalDate now = LocalDate.now();
        return switch (period) {
            case "DAILY"   -> new LocalDate[]{ now, now };
            case "WEEKLY"  -> new LocalDate[]{ now.with(java.time.DayOfWeek.MONDAY), now };
            case "YEARLY"  -> new LocalDate[]{ now.withDayOfYear(1), now };
            case "ALL"     -> new LocalDate[]{ LocalDate.of(2000, 1, 1), now };
            case "CUSTOM"  -> new LocalDate[]{
                from != null ? from : now.withDayOfMonth(1),
                to   != null ? to   : now
            };
            default        -> new LocalDate[]{ now.withDayOfMonth(1), now };
        };
    }
}
