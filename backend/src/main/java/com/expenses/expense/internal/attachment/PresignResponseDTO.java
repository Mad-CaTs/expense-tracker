package com.expenses.expense.internal.attachment;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PresignResponseDTO {
    private String presignedUrl;
    private Long attachmentId;
}
