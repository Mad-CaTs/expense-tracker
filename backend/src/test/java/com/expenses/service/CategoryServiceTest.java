package com.expenses.service;

import com.expenses.dto.CategoryDTO;
import com.expenses.entity.Category;
import com.expenses.entity.User;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock CategoryRepository categoryRepository;
    @InjectMocks CategoryService categoryService;

    private Category category;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        category = new Category();
        category.setId(1L);
        category.setName("Comida");
        category.setColor("#EF4444");
        category.setIcon("utensils");
        category.setUser(user);
    }

    @Test
    void findAll_returnsUserCategories() {
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of(category));
        List<CategoryDTO> result = categoryService.findAll(1L);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Comida");
    }

    @Test
    void findById_whenExists_returnsDTO() {
        when(categoryRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(category));
        CategoryDTO result = categoryService.findById(1L, 1L);
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void findById_whenNotExists_throwsException() {
        when(categoryRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> categoryService.findById(99L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_savesAndReturnsDTO() {
        CategoryDTO dto = new CategoryDTO();
        dto.setName("Transporte");
        dto.setColor("#3B82F6");
        dto.setIcon("car");

        Category saved = new Category();
        saved.setId(2L);
        saved.setName("Transporte");
        saved.setColor("#3B82F6");
        saved.setIcon("car");
        saved.setUser(user);

        when(categoryRepository.save(any())).thenReturn(saved);
        CategoryDTO result = categoryService.create(dto, 1L, user);
        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getName()).isEqualTo("Transporte");
    }

    @Test
    void delete_whenExists_deletesCategory() {
        when(categoryRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(category));
        categoryService.delete(1L, 1L);
        verify(categoryRepository).deleteById(1L);
    }

    @Test
    void delete_whenNotExists_throwsException() {
        when(categoryRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> categoryService.delete(99L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
