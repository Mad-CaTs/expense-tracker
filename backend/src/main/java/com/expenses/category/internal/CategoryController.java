package com.expenses.category.internal;

import com.expenses.category.CategoryType;
import com.expenses.shared.security.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final AuthenticatedUserResolver userResolver;

    /** `walletId` opcional: filtra las ocultas en esa billetera (ver CategoryService). */
    @GetMapping
    public List<CategoryResponse> findAll(@RequestParam(required = false) CategoryType type,
                                          @RequestParam(required = false) Long walletId) {
        return categoryService.findAll(userResolver.getCurrentUserId(), type, walletId);
    }

    @GetMapping("/{id}")
    public CategoryResponse findById(@PathVariable Long id) {
        return categoryService.findById(id, userResolver.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        var user = userResolver.getCurrentUser();
        return categoryService.create(request, user.getId(), user);
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return categoryService.update(id, request, userResolver.getCurrentUserId());
    }

    /** En qué billeteras está oculta esta categoría. */
    @GetMapping("/{id}/hidden-in")
    public List<Long> hiddenIn(@PathVariable Long id) {
        return categoryService.hiddenIn(id, userResolver.getCurrentUserId());
    }

    /** Oculta o vuelve a mostrar la categoría en una billetera. */
    @PutMapping("/{id}/visibility")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setVisibility(@PathVariable Long id, @Valid @RequestBody CategoryVisibilityRequest request) {
        categoryService.setHidden(id, request.walletId(), request.hidden(), userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        categoryService.delete(id, userResolver.getCurrentUserId());
    }
}
