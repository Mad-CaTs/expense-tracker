package com.expenses.category.internal;

import com.expenses.category.Category;
import com.expenses.category.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(Long userId);
    List<Category> findByUserIdAndType(Long userId, CategoryType type);
    Optional<Category> findByIdAndUserId(Long id, Long userId);
    boolean existsByUserIdAndType(Long userId, CategoryType type);
}
