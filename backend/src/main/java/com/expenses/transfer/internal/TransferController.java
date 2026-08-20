package com.expenses.transfer.internal;

import com.expenses.shared.security.AuthenticatedUserResolver;
import com.expenses.shared.web.PageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public PageResponse<TransferResponse> findAll(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return PageResponse.from(transferService.findAll(userResolver.getCurrentUserId(),
                PageRequest.of(page, size, Sort.by(Sort.Order.desc("date"), Sort.Order.desc("id")))));
    }

    @GetMapping("/{id}")
    public TransferResponse findById(@PathVariable Long id) {
        return transferService.findById(id, userResolver.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransferResponse create(@Valid @RequestBody TransferRequest request) {
        var user = userResolver.getCurrentUser();
        return transferService.create(request, user.getId(), user);
    }

    @PutMapping("/{id}")
    public TransferResponse update(@PathVariable Long id, @Valid @RequestBody TransferRequest request) {
        return transferService.update(id, request, userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        transferService.delete(id, userResolver.getCurrentUserId());
    }
}
