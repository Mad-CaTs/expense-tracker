package com.expenses.expense.internal;

import com.expenses.expense.ExpenseResponse;
import com.expenses.expense.internal.attachment.AttachmentStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", imports = AttachmentStatus.class)
public interface ExpenseMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "categoryColor", source = "category.color")
    @Mapping(target = "categoryIcon", source = "category.icon")
    @Mapping(target = "walletId", source = "wallet.id")
    @Mapping(target = "walletName", source = "wallet.name")
    @Mapping(target = "attachmentCount",
             expression = "java((int) expense.getAttachments().stream()"
                     + ".filter(a -> a.getStatus() == AttachmentStatus.CONFIRMED).count())")
    ExpenseResponse toResponse(Expense expense);
}
