package com.expenses.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PresignResponseDTO {
    private String presignedUrl;
    private Long attachmentId;
}
