package com.expenses.controller;

import com.expenses.dto.WalletDTO;
import com.expenses.security.AuthenticatedUserResolver;
import com.expenses.service.WalletService;
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
    public List<WalletDTO> findAll() {
        return walletService.findAll(userResolver.getCurrentUserId());
    }

    @GetMapping("/{id}")
    public WalletDTO findById(@PathVariable Long id) {
        return walletService.findById(id, userResolver.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WalletDTO create(@Valid @RequestBody WalletDTO dto) {
        return walletService.create(dto, userResolver.getCurrentUser());
    }

    @PutMapping("/{id}")
    public WalletDTO update(@PathVariable Long id, @Valid @RequestBody WalletDTO dto) {
        return walletService.update(id, dto, userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        walletService.delete(id, userResolver.getCurrentUserId());
    }
}
