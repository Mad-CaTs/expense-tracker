package com.expenses.expense.internal.attachment;

import com.expenses.shared.security.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses/{expenseId}/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public List<AttachmentDTO> findAll(@PathVariable Long expenseId) {
        return attachmentService.findAll(expenseId, userResolver.getCurrentUserId());
    }

    @PostMapping("/presign")
    @ResponseStatus(HttpStatus.CREATED)
    public PresignResponseDTO presign(@PathVariable Long expenseId,
                                      @Valid @RequestBody PresignRequestDTO req) {
        return attachmentService.presign(expenseId, userResolver.getCurrentUserId(), req);
    }

    @PostMapping("/{attachmentId}/confirm")
    public AttachmentDTO confirm(@PathVariable Long expenseId,
                                 @PathVariable Long attachmentId) {
        return attachmentService.confirm(expenseId, attachmentId, userResolver.getCurrentUserId());
    }

    @GetMapping("/{attachmentId}/presign-download")
    public String presignDownload(@PathVariable Long expenseId,
                                   @PathVariable Long attachmentId) {
        return attachmentService.presignDownload(expenseId, attachmentId, userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{attachmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long expenseId,
                        @PathVariable Long attachmentId) {
        attachmentService.delete(expenseId, attachmentId, userResolver.getCurrentUserId());
    }
}
