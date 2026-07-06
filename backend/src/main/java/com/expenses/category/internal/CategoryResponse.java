package com.expenses.category.internal;

public record CategoryResponse(
        Long id,
        String name,
        String color,
        String icon,
        String type) {
}
