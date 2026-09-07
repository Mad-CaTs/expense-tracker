package com.expenses.category.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CategoryVisibilityRepository
        extends JpaRepository<CategoryVisibility, CategoryVisibility.Key> {

    /** Ids de las categorías ocultas en una billetera. */
    @Query("select v.categoryId from CategoryVisibility v where v.walletId = :walletId")
    List<Long> findHiddenCategoryIds(Long walletId);

    /** Billeteras donde una categoría está oculta; lo necesita el detalle. */
    @Query("select v.walletId from CategoryVisibility v where v.categoryId = :categoryId")
    List<Long> findWalletIdsHiding(Long categoryId);

    void deleteByCategoryIdAndWalletId(Long categoryId, Long walletId);

    boolean existsByCategoryIdAndWalletId(Long categoryId, Long walletId);
}
