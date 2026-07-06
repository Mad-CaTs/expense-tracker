package com.expenses.expense.internal;

import com.expenses.expense.internal.attachment.ExpenseAttachment;
import com.expenses.shared.user.User;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;

class EntityContractsTest {

    @Test
    void toString_onBidirectionalExpenseAttachment_doesNotStackOverflow() {
        Expense expense = new Expense();
        expense.setId(1L);
        expense.setAmount(new BigDecimal("10.00"));
        expense.setDate(LocalDate.now());

        ExpenseAttachment attachment = new ExpenseAttachment();
        attachment.setId(2L);
        attachment.setExpense(expense);
        expense.getAttachments().add(attachment);

        assertThatCode(expense::toString).doesNotThrowAnyException();
        assertThatCode(attachment::toString).doesNotThrowAnyException();
    }

    @Test
    void equals_isBasedOnIdOnly() {
        Expense a = new Expense();
        a.setId(7L);
        a.setAmount(new BigDecimal("10.00"));

        Expense b = new Expense();
        b.setId(7L);
        b.setAmount(new BigDecimal("99.99"));

        Expense c = new Expense();
        c.setId(8L);

        assertThat(a).isEqualTo(b).hasSameHashCodeAs(b).isNotEqualTo(c);
    }

    @Test
    void userToString_neverExposesPasswordHash() {
        User user = new User();
        user.setId(1L);
        user.setUsername("markus");
        user.setPasswordHash("super-secreto");

        assertThat(user.toString()).doesNotContain("super-secreto");
    }
}
