package com.expenses.category;

import com.expenses.category.internal.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CategoryFinder {

    private final CategoryRepository categoryRepository;

    public Optional<Category> findOwned(Long categoryId, Long userId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId);
    }
}
