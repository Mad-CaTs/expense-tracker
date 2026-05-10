package com.expenses.service;

import com.expenses.dto.CategoryDTO;
import com.expenses.entity.Category;
import com.expenses.entity.User;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDTO> findAll(Long userId) {
        return categoryRepository.findByUserId(userId).stream().map(this::toDTO).toList();
    }

    public CategoryDTO findById(Long id, Long userId) {
        return categoryRepository.findByIdAndUserId(id, userId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));
    }

    @Transactional
    public CategoryDTO create(CategoryDTO dto, Long userId, User user) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setColor(dto.getColor());
        category.setIcon(dto.getIcon());
        category.setUser(user);
        return toDTO(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDTO update(Long id, CategoryDTO dto, Long userId) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));
        category.setName(dto.getName());
        category.setColor(dto.getColor());
        category.setIcon(dto.getIcon());
        return toDTO(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));
        categoryRepository.deleteById(id);
    }

    private CategoryDTO toDTO(Category c) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setColor(c.getColor());
        dto.setIcon(c.getIcon());
        return dto;
    }
}
