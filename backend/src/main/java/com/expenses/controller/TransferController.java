package com.expenses.controller;

import com.expenses.dto.TransferDTO;
import com.expenses.security.AuthenticatedUserResolver;
import com.expenses.service.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public Page<TransferDTO> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return transferService.findAll(userResolver.getCurrentUserId(),
                PageRequest.of(page, size, Sort.by("date").descending()));
    }

    @GetMapping("/{id}")
    public TransferDTO findById(@PathVariable Long id) {
        return transferService.findById(id, userResolver.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransferDTO create(@Valid @RequestBody TransferDTO dto) {
        var user = userResolver.getCurrentUser();
        return transferService.create(dto, user.getId(), user);
    }
}
