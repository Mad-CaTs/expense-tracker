package com.expenses.category;

import com.expenses.category.internal.CategoryRepository;
import com.expenses.shared.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CategoryDefaults {

    private final CategoryRepository categoryRepository;

    @Transactional
    public void ensureDefaultCategoriesFor(User user) {
        if (!categoryRepository.existsByUserIdAndType(user.getId(), CategoryType.EXPENSE)) {
            categoryRepository.saveAll(defaultExpenseCategories(user));
        }
        if (!categoryRepository.existsByUserIdAndType(user.getId(), CategoryType.INCOME)) {
            categoryRepository.saveAll(defaultIncomeCategories(user));
        }
    }

    private List<Category> defaultExpenseCategories(User user) {
        return List.of(
            category("Comida",          "#EF4444", "utensils",      CategoryType.EXPENSE, user),
            category("Transporte",      "#3B82F6", "car",           CategoryType.EXPENSE, user),
            category("Salud",           "#10B981", "heart-pulse",   CategoryType.EXPENSE, user),
            category("Entretenimiento", "#8B5CF6", "film",          CategoryType.EXPENSE, user),
            category("Hogar",           "#F59E0B", "home",          CategoryType.EXPENSE, user),
            category("Otros",           "#6B7280", "ellipsis",      CategoryType.EXPENSE, user)
        );
    }

    private List<Category> defaultIncomeCategories(User user) {
        return List.of(
            category("Salario",     "#10B981", "banknote",    CategoryType.INCOME, user),
            category("Freelance",   "#3B82F6", "laptop",      CategoryType.INCOME, user),
            category("Inversiones", "#8B5CF6", "trending-up", CategoryType.INCOME, user),
            category("Otros",       "#6B7280", "ellipsis",    CategoryType.INCOME, user)
        );
    }

    private Category category(String name, String color, String icon, CategoryType type, User user) {
        Category c = new Category();
        c.setName(name);
        c.setColor(color);
        c.setIcon(icon);
        c.setType(type);
        c.setUser(user);
        return c;
    }
}
