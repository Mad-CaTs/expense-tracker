package com.expenses.category.internal;

import com.expenses.category.Category;
import com.expenses.category.CategoryType;
import com.expenses.shared.user.User;
import com.expenses.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private static final String CATEGORY_NOT_FOUND = "Categoría no encontrada: ";

    private final CategoryRepository categoryRepository;
    private final CategoryVisibilityRepository visibilityRepository;
    private final CategoryMapper categoryMapper;

    /**
     * Categorías del usuario. Con `walletId` se excluyen las ocultas en esa
     * billetera — es lo que piden los formularios de gasto e ingreso. SIN
     * `walletId` devuelve todas: reportes, presupuestos y la pantalla de
     * categorías necesitan el conjunto completo para no perder agregación.
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll(Long userId, CategoryType type, Long walletId) {
        List<Category> categories = type != null
                ? categoryRepository.findByUserIdAndType(userId, type)
                : categoryRepository.findByUserId(userId);

        if (walletId != null) {
            var hidden = Set.copyOf(visibilityRepository.findHiddenCategoryIds(walletId));
            categories = categories.stream().filter(c -> !hidden.contains(c.getId())).toList();
        }
        return categories.stream().map(categoryMapper::toResponse).toList();
    }

    /** Billeteras donde esta categoría está oculta. */
    @Transactional(readOnly = true)
    public List<Long> hiddenIn(Long categoryId, Long userId) {
        categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(CATEGORY_NOT_FOUND + categoryId));
        return visibilityRepository.findWalletIdsHiding(categoryId);
    }

    /**
     * Oculta o vuelve a mostrar una categoría en una billetera.
     *
     * Comprueba que la categoría sea del usuario: sin eso, cualquiera podría
     * escribir filas para categorías ajenas.
     */
    @Transactional
    public void setHidden(Long categoryId, Long walletId, boolean hidden, Long userId) {
        categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(CATEGORY_NOT_FOUND + categoryId));

        if (hidden) {
            if (!visibilityRepository.existsByCategoryIdAndWalletId(categoryId, walletId)) {
                visibilityRepository.save(new CategoryVisibility(categoryId, walletId));
            }
        } else {
            visibilityRepository.deleteByCategoryIdAndWalletId(categoryId, walletId);
        }
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
