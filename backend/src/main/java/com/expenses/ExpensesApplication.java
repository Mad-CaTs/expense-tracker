package com.expenses;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ExpensesApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExpensesApplication.class, args);
    }
}
