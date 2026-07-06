package com.expenses.expense.internal.attachment;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AttachmentMapper {

    AttachmentDTO toDTO(ExpenseAttachment attachment);
}
