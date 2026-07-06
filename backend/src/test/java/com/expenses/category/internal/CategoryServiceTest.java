package com.expenses.category.internal;

import com.expenses.category.Category;
import com.expenses.category.CategoryType;
import com.expenses.shared.user.User;
import com.expenses.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock CategoryRepository categoryRepository;
    @Spy CategoryMapper categoryMapper = Mappers.getMapper(CategoryMapper.class);
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
        List<CategoryResponse> result = categoryService.findAll(1L, null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Comida");
    }

    @Test
    void findAll_withType_filtersByType() {
        when(categoryRepository.findByUserIdAndType(1L, CategoryType.INCOME)).thenReturn(List.of());
        List<CategoryResponse> result = categoryService.findAll(1L, CategoryType.INCOME);
        assertThat(result).isEmpty();
        verify(categoryRepository, never()).findByUserId(anyLong());
    }

    @Test
    void findById_whenExists_returnsDTO() {
        when(categoryRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(category));
        CategoryResponse result = categoryService.findById(1L, 1L);
        assertThat(result.id()).isEqualTo(1L);
    }

    @Test
    void findById_whenNotExists_throwsException() {
        when(categoryRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> categoryService.findById(99L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_savesAndReturnsDTO() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Transporte");
        request.setColor("#3B82F6");
        request.setIcon("car");

        Category saved = new Category();
        saved.setId(2L);
        saved.setName("Transporte");
        saved.setColor("#3B82F6");
        saved.setIcon("car");
        saved.setUser(user);

        when(categoryRepository.save(any())).thenReturn(saved);
        CategoryResponse result = categoryService.create(request, 1L, user);
        assertThat(result.id()).isEqualTo(2L);
        assertThat(result.name()).isEqualTo("Transporte");
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
