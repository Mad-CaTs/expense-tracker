package com.expenses.expense.internal.attachment;

import com.expenses.expense.internal.Expense;
import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.exception.ResourceNotFoundException;
import com.expenses.expense.internal.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private static final long MAX_FILE_SIZE = 10_485_760L;
    private static final int MAGIC_BYTES = 64;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "application/pdf");
    private static final Map<String, Set<String>> VALID_EXTENSIONS = Map.of(
            "image/jpeg", Set.of(".jpg", ".jpeg"),
            "image/png", Set.of(".png"),
            "image/webp", Set.of(".webp"),
            "application/pdf", Set.of(".pdf"));

    private static final Tika TIKA = new Tika();

    private final ExpenseAttachmentRepository attachmentRepository;
    private final ExpenseRepository expenseRepository;
    private final R2Service r2Service;
    private final AttachmentMapper attachmentMapper;

    @Transactional(readOnly = true)
    public List<AttachmentDTO> findAll(Long expenseId, Long userId) {
        verifyOwnership(expenseId, userId);
        return attachmentRepository.findByExpenseIdAndStatus(expenseId, AttachmentStatus.CONFIRMED)
                .stream().map(attachmentMapper::toDTO).toList();
    }

    @Transactional
    public PresignResponseDTO presign(Long expenseId, Long userId, PresignRequestDTO req) {
        if (!ALLOWED_TYPES.contains(req.getContentType())) {
            throw new BusinessRuleException("Tipo de archivo no permitido: " + req.getContentType());
        }
        if (req.getFileSize() > MAX_FILE_SIZE) {
            throw new BusinessRuleException("El archivo supera el límite de 10 MB");
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
        attachment.setStatus(AttachmentStatus.PENDING);
        attachment = attachmentRepository.save(attachment);

        String url = r2Service.generateUploadUrl(fileKey, req.getContentType(), Duration.ofMinutes(5));
        return new PresignResponseDTO(url, attachment.getId());
    }

    @Transactional(noRollbackFor = BusinessRuleException.class)
    public AttachmentDTO confirm(Long expenseId, Long attachmentId, Long userId) {
        verifyOwnership(expenseId, userId);
        ExpenseAttachment attachment = requireAttachment(expenseId, attachmentId, userId);
        if (attachment.getStatus() == AttachmentStatus.CONFIRMED) {
            return attachmentMapper.toDTO(attachment);
        }

        Long realSize = r2Service.objectSize(attachment.getFileKey());
        if (realSize == null) {
            throw new BusinessRuleException("El archivo aún no se ha subido");
        }
        if (realSize > MAX_FILE_SIZE) {
            reject(attachment, userId, "tamaño real " + realSize + " bytes supera el límite");
            throw new BusinessRuleException("El archivo supera el límite de 10 MB");
        }

        String detectedType = TIKA.detect(r2Service.readHead(attachment.getFileKey(), MAGIC_BYTES));
        if (!detectedType.equals(attachment.getContentType())) {
            reject(attachment, userId, "tipo real " + detectedType + " != declarado " + attachment.getContentType());
            throw new BusinessRuleException(
                    "El contenido real del archivo (" + detectedType + ") no coincide con el tipo declarado");
        }

        String extension = extractExtension(attachment.getFileKey()).toLowerCase();
        if (!VALID_EXTENSIONS.get(detectedType).contains(extension)) {
            reject(attachment, userId, "extensión " + extension + " no corresponde a " + detectedType);
            throw new BusinessRuleException("La extensión del archivo no corresponde a su contenido real");
        }

        attachment.setFileSize(realSize);
        attachment.setStatus(AttachmentStatus.CONFIRMED);
        return attachmentMapper.toDTO(attachmentRepository.save(attachment));
    }

    @Transactional(readOnly = true)
    public String presignDownload(Long expenseId, Long attachmentId, Long userId) {
        verifyOwnership(expenseId, userId);
        ExpenseAttachment attachment = requireAttachment(expenseId, attachmentId, userId);
        if (attachment.getStatus() != AttachmentStatus.CONFIRMED) {
            throw new ResourceNotFoundException("Adjunto no encontrado: " + attachmentId);
        }
        return r2Service.generateDownloadUrl(attachment.getFileKey(), attachment.getFileName(), Duration.ofMinutes(2));
    }

    @Transactional
    public void delete(Long expenseId, Long attachmentId, Long userId) {
        verifyOwnership(expenseId, userId);
        ExpenseAttachment attachment = requireAttachment(expenseId, attachmentId, userId);
        r2Service.deleteObject(attachment.getFileKey());
        attachmentRepository.delete(attachment);
    }

    private void reject(ExpenseAttachment attachment, Long userId, String reason) {
        log.warn("Adjunto rechazado en confirmación (user {}, attachment {}): {}",
                userId, attachment.getId(), reason);
        r2Service.deleteObject(attachment.getFileKey());
        attachmentRepository.delete(attachment);
    }

    private ExpenseAttachment requireAttachment(Long expenseId, Long attachmentId, Long userId) {
        return attachmentRepository
                .findByIdAndExpenseUserIdAndExpenseId(attachmentId, userId, expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto no encontrado: " + attachmentId));
    }

    private Expense verifyOwnership(Long expenseId, Long userId) {
        return expenseRepository.findByIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado: " + expenseId));
    }

    private String extractExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot >= 0 ? fileName.substring(dot) : "";
    }
}
