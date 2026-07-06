package com.expenses.expense.internal.attachment;

import com.expenses.expense.internal.Expense;
import com.expenses.expense.internal.ExpenseRepository;
import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttachmentServiceTest {

    private static final byte[] PNG_MAGIC = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
    private static final byte[] EXE_MAGIC = buildExeHeader();

    @Mock ExpenseAttachmentRepository attachmentRepository;
    @Mock ExpenseRepository expenseRepository;
    @Mock R2Service r2Service;
    @Spy AttachmentMapper attachmentMapper = Mappers.getMapper(AttachmentMapper.class);
    @InjectMocks AttachmentService attachmentService;

    private Expense expense;
    private ExpenseAttachment attachment;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1L);

        expense = new Expense();
        expense.setId(10L);
        expense.setUser(user);

        attachment = new ExpenseAttachment();
        attachment.setId(5L);
        attachment.setExpense(expense);
        attachment.setFileKey("1/10/abc.png");
        attachment.setFileName("foto.png");
        attachment.setContentType("image/png");
        attachment.setFileSize(1000L);
        attachment.setStatus(AttachmentStatus.PENDING);

        when(expenseRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(expense));
        when(attachmentRepository.findByIdAndExpenseUserIdAndExpenseId(5L, 1L, 10L))
                .thenReturn(Optional.of(attachment));
    }

    @Test
    void confirm_executableDisguisedAsPng_rejectsAndDeletesEverything() {
        when(r2Service.objectSize("1/10/abc.png")).thenReturn(2048L);
        when(r2Service.readHead(eq("1/10/abc.png"), anyInt())).thenReturn(EXE_MAGIC);

        assertThatThrownBy(() -> attachmentService.confirm(10L, 5L, 1L))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("no coincide con el tipo declarado");

        verify(r2Service).deleteObject("1/10/abc.png");
        verify(attachmentRepository).delete(attachment);
    }

    @Test
    void confirm_realPng_confirmsAndUpdatesRealSize() {
        when(r2Service.objectSize("1/10/abc.png")).thenReturn(2048L);
        when(r2Service.readHead(eq("1/10/abc.png"), anyInt())).thenReturn(PNG_MAGIC);
        when(attachmentRepository.save(attachment)).thenReturn(attachment);

        AttachmentDTO result = attachmentService.confirm(10L, 5L, 1L);

        assertThat(result.getStatus()).isEqualTo("CONFIRMED");
        assertThat(attachment.getFileSize()).isEqualTo(2048L);
        verify(r2Service, never()).deleteObject(anyString());
    }

    @Test
    void confirm_extensionMismatch_rejects() {
        attachment.setFileKey("1/10/abc.pdf");
        attachment.setContentType("image/png");
        when(r2Service.objectSize("1/10/abc.pdf")).thenReturn(2048L);
        when(r2Service.readHead(eq("1/10/abc.pdf"), anyInt())).thenReturn(PNG_MAGIC);

        assertThatThrownBy(() -> attachmentService.confirm(10L, 5L, 1L))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("extensión");

        verify(r2Service).deleteObject("1/10/abc.pdf");
        verify(attachmentRepository).delete(attachment);
    }

    @Test
    void confirm_notUploadedYet_failsWithoutDeleting() {
        when(r2Service.objectSize("1/10/abc.png")).thenReturn(null);

        assertThatThrownBy(() -> attachmentService.confirm(10L, 5L, 1L))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("aún no se ha subido");

        verify(r2Service, never()).deleteObject(anyString());
        verify(attachmentRepository, never()).delete(any(ExpenseAttachment.class));
    }

    @Test
    void confirm_alreadyConfirmed_isIdempotent() {
        attachment.setStatus(AttachmentStatus.CONFIRMED);

        AttachmentDTO result = attachmentService.confirm(10L, 5L, 1L);

        assertThat(result.getStatus()).isEqualTo("CONFIRMED");
        verifyNoInteractions(r2Service);
    }

    private static byte[] buildExeHeader() {
        byte[] header = new byte[64];
        header[0] = 'M';
        header[1] = 'Z';
        Arrays.fill(header, 2, 64, (byte) 0x90);
        return header;
    }
}
