package com.expenses;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModule;
import org.springframework.modulith.core.ApplicationModules;

import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class ModularityTests {

    private final ApplicationModules modules = ApplicationModules.of(ExpensesApplication.class);

    @Test
    void verifiesModularStructure() {
        assertThatCode(modules::verify).doesNotThrowAnyException();
    }

    @Test
    void exposesExpectedModules() {
        Set<String> moduleNames = modules.stream()
                .map(ApplicationModule::getName)
                .collect(Collectors.toSet());

        assertThat(moduleNames).contains(
                "wallet", "expense", "income", "transfer",
                "budget", "recurring", "category", "report", "auth");
    }
}
