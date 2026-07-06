package com.expenses.wallet.internal;

import com.expenses.shared.security.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public List<WalletResponse> findAll() {
        return walletService.findAll(userResolver.getCurrentUserId());
    }

    @GetMapping("/{id}")
    public WalletResponse findById(@PathVariable Long id) {
        return walletService.findById(id, userResolver.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WalletResponse create(@Valid @RequestBody WalletRequest request) {
        return walletService.create(request, userResolver.getCurrentUser());
    }

    @PutMapping("/{id}")
    public WalletResponse update(@PathVariable Long id, @Valid @RequestBody WalletRequest request) {
        return walletService.update(id, request, userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        walletService.delete(id, userResolver.getCurrentUserId());
    }
}
