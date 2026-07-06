package com.expenses.wallet.internal;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/card-backgrounds")
@RequiredArgsConstructor
public class CardBackgroundController {

    private final CardBackgroundRepository repository;
    private final CardBackgroundMapper mapper;

    @GetMapping
    public List<CardBackgroundDTO> findAll() {
        return mapper.toDTOs(repository.findAllByOrderByPositionAsc());
    }
}
