package com.expenses.recurring.internal;

import com.expenses.shared.security.AuthenticatedUserResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring/occurrences")
@RequiredArgsConstructor
public class RecurringOccurrenceController {

    private final RecurringOccurrenceService occurrenceService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping("/pending")
    public List<OccurrenceResponse> pending() {
        return occurrenceService.findPending(userResolver.getCurrentUserId());
    }

    @GetMapping("/history")
    public List<OccurrenceResponse> history(@RequestParam Long recurringId) {
        return occurrenceService.history(recurringId, userResolver.getCurrentUserId());
    }

    @PostMapping("/{id}/confirm")
    public OccurrenceResponse confirm(@PathVariable Long id) {
        return occurrenceService.confirm(id, userResolver.getCurrentUserId());
    }

    @PostMapping("/{id}/reject")
    public OccurrenceResponse reject(@PathVariable Long id) {
        return occurrenceService.reject(id, userResolver.getCurrentUserId());
    }

    @PostMapping("/{id}/pay-debt")
    public OccurrenceResponse payDebt(@PathVariable Long id) {
        return occurrenceService.payDebt(id, userResolver.getCurrentUserId());
    }
}
