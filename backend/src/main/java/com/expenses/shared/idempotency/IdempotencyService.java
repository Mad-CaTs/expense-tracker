package com.expenses.shared.idempotency;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final IdempotencyKeyRepository repository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Long register(Long userId, String key, String requestHash, String requestPath) {
        IdempotencyKey entry = new IdempotencyKey();
        entry.setUserId(userId);
        entry.setKey(key);
        entry.setRequestHash(requestHash);
        entry.setRequestPath(requestPath);
        return repository.saveAndFlush(entry).getId();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public Optional<IdempotencyKey> findExisting(Long userId, String key) {
        return repository.findByUserIdAndKey(userId, key);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void complete(Long id, int responseStatus, String responseBody) {
        repository.findById(id).ifPresent(entry -> {
            entry.setResponseStatus(responseStatus);
            entry.setResponseBody(responseBody);
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void discard(Long id) {
        repository.deleteById(id);
    }
}
