package com.expenses.recurring.internal;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RecurringOccurrenceMapper {

    @Mapping(target = "recurringId", source = "recurring.id")
    @Mapping(target = "description", source = "recurring.description")
    @Mapping(target = "categoryId", source = "recurring.category.id")
    @Mapping(target = "categoryName", source = "recurring.category.name")
    @Mapping(target = "categoryColor", source = "recurring.category.color")
    @Mapping(target = "categoryIcon", source = "recurring.category.icon")
    @Mapping(target = "walletId", source = "recurring.wallet.id")
    @Mapping(target = "walletName", source = "recurring.wallet.name")
    OccurrenceResponse toResponse(RecurringOccurrence occurrence);
}
