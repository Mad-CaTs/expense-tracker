package com.expenses.budget.internal;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface BudgetMapper {

    @Mapping(target = "categoryId", source = "budget.category.id")
    @Mapping(target = "categoryName", source = "budget.category.name")
    @Mapping(target = "categoryColor", source = "budget.category.color")
    @Mapping(target = "categoryIcon", source = "budget.category.icon")
    @Mapping(target = "walletId", source = "budget.wallet.id")
    @Mapping(target = "walletName", source = "budget.wallet.name")
    @Mapping(target = "amount", source = "budget.amount")
    @Mapping(target = "spent", source = "spent")
    @Mapping(target = "percentage", source = "percentage")
    BudgetResponse toResponse(Budget budget, BigDecimal spent, double percentage);
}
