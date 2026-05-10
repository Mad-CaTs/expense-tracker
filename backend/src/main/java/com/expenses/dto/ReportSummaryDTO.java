package com.expenses.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ReportSummaryDTO {
    private BigDecimal currentTotal;
    private BigDecimal previousTotal;
    private Double changePercentage;
    private BigDecimal dailyAverage;
    private String period;
    private String currentFrom;
    private String currentTo;
    private String previousFrom;
    private String previousTo;
}
