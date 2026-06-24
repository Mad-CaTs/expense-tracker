package com.expenses.controller;

import com.expenses.dto.CardBackgroundDTO;
import com.expenses.repository.CardBackgroundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/card-backgrounds")
@RequiredArgsConstructor
public class CardBackgroundController {

    private final CardBackgroundRepository repository;

    @GetMapping
    public List<CardBackgroundDTO> findAll() {
        return repository.findAllByOrderByPositionAsc().stream().map(b -> {
            CardBackgroundDTO dto = new CardBackgroundDTO();
            dto.setId(b.getId());
            dto.setName(b.getName());
            dto.setImageUrl(b.getImageUrl());
            return dto;
        }).toList();
    }
}
