package com.expenses.category.internal;

import com.expenses.category.Category;
import com.expenses.category.CategoryType;
import com.expenses.shared.user.User;
import com.expenses.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private static final String CATEGORY_NOT_FOUND = "Categoría no encontrada: ";

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll(Long userId, CategoryType type) {
        List<Category> categories = type != null
                ? categoryRepository.findByUserIdAndType(userId, type)
                : categoryRepository.findByUserId(userId);
        return categories.stream().map(categoryMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id, Long userId) {
        return categoryRepository.findByIdAndUserId(id, userId)
                .map(categoryMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(CATEGORY_NOT_FOUND + id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request, Long userId, User user) {
        Category category = new Category();
        category.setName(request.getName());
        category.setColor(request.getColor());
        category.setIcon(request.getIcon());
        category.setType(request.getType() != null ? CategoryType.valueOf(request.getType()) : CategoryType.EXPENSE);
        category.setUser(user);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request, Long userId) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(CATEGORY_NOT_FOUND + id));
        category.setName(request.getName());
        category.setColor(request.getColor());
        category.setIcon(request.getIcon());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(CATEGORY_NOT_FOUND + id));
        categoryRepository.deleteById(id);
    }
}
