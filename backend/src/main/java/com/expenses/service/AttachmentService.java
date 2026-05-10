package com.expenses.service;

import com.expenses.dto.AttachmentDTO;
import com.expenses.dto.PresignRequestDTO;
import com.expenses.dto.PresignResponseDTO;
import com.expenses.entity.Expense;
import com.expenses.entity.ExpenseAttachment;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.repository.ExpenseAttachmentRepository;
import com.expenses.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private static final long MAX_FILE_SIZE = 10_485_760L;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "application/pdf");

    private final ExpenseAttachmentRepository attachmentRepository;
    private final ExpenseRepository expenseRepository;
    private final R2Service r2Service;

    public List<AttachmentDTO> findAll(Long expenseId, Long userId) {
        verifyOwnership(expenseId, userId);
        return attachmentRepository.findByExpenseId(expenseId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public PresignResponseDTO presign(Long expenseId, Long userId, PresignRequestDTO req) {
        if (!ALLOWED_TYPES.contains(req.getContentType())) {
            throw new IllegalArgumentException("Tipo de archivo no permitido: " + req.getContentType());
        }
        if (req.getFileSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("El archivo supera el límite de 10 MB");
        }
        Expense expense = verifyOwnership(expenseId, userId);

        String ext = extractExtension(req.getFileName());
        String fileKey = userId + "/" + expenseId + "/" + UUID.randomUUID() + ext;

        ExpenseAttachment attachment = new ExpenseAttachment();
        attachment.setExpense(expense);
        attachment.setFileKey(fileKey);
        attachment.setFileName(req.getFileName());
        attachment.setContentType(req.getContentType());
        attachment.setFileSize(req.getFileSize());
        attachment = attachmentRepository.save(attachment);

        String url = r2Service.generateUploadUrl(fileKey, req.getContentType(), Duration.ofMinutes(5));
        return new PresignResponseDTO(url, attachment.getId());
    }

    public String presignDownload(Long expenseId, Long attachmentId, Long userId) {
        verifyOwnership(expenseId, userId);
        ExpenseAttachment attachment = attachmentRepository
                .findByIdAndExpenseUserIdAndExpenseId(attachmentId, userId, expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto no encontrado: " + attachmentId));
        return r2Service.generateDownloadUrl(attachment.getFileKey(), attachment.getFileName(), Duration.ofMinutes(2));
    }

    @Transactional
    public void delete(Long expenseId, Long attachmentId, Long userId) {
        verifyOwnership(expenseId, userId);
        ExpenseAttachment attachment = attachmentRepository
                .findByIdAndExpenseUserIdAndExpenseId(attachmentId, userId, expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto no encontrado: " + attachmentId));
        r2Service.deleteObject(attachment.getFileKey());
        attachmentRepository.delete(attachment);
    }

    private Expense verifyOwnership(Long expenseId, Long userId) {
        return expenseRepository.findByIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado: " + expenseId));
    }

    private AttachmentDTO toDTO(ExpenseAttachment a) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(a.getId());
        dto.setFileName(a.getFileName());
        dto.setContentType(a.getContentType());
        dto.setFileSize(a.getFileSize());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }

    private String extractExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot >= 0 ? fileName.substring(dot) : "";
    }
}
