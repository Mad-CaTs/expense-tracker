package com.expenses.report.internal;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CategoryBreakdownDTO {
    private String categoryName;
    private BigDecimal total;
    private Double percentage;
    private Long count;
    private String color;
    private String icon;
    private String type;
}
