package com.expenses.expense.internal.attachment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.time.Duration;

@Service
@Slf4j
public class R2Service {

    private final S3Client s3Client;
    private final S3Presigner presigner;
    private final String bucket;

    public R2Service(
            @Value("${r2.access-key}") String accessKey,
            @Value("${r2.secret-key}") String secretKey,
            @Value("${r2.endpoint}") String endpoint,
            @Value("${r2.bucket}") String bucket) {
        this.bucket = bucket;
        var credentials = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));
        var uri = URI.create(endpoint);
        this.s3Client = S3Client.builder()
                .credentialsProvider(credentials)
                .endpointOverride(uri)
                .region(Region.of("auto"))
                .build();
        this.presigner = S3Presigner.builder()
                .credentialsProvider(credentials)
                .endpointOverride(uri)
                .region(Region.of("auto"))
                .build();
    }

    public String generateUploadUrl(String fileKey, String contentType, Duration expiration) {
        var presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(expiration)
                .putObjectRequest(put -> put
                        .bucket(bucket)
                        .key(fileKey)
                        .contentType(contentType))
                .build();
        return presigner.presignPutObject(presignRequest).url().toString();
    }

    public String generateDownloadUrl(String fileKey, String fileName, Duration expiration) {
        var disposition = "attachment; filename=\"" + fileName.replace("\"", "") + "\"";
        var presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(expiration)
                .getObjectRequest(get -> get
                        .bucket(bucket)
                        .key(fileKey)
                        .responseContentDisposition(disposition))
                .build();
        return presigner.presignGetObject(presignRequest).url().toString();
    }

    public void deleteObject(String fileKey) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(fileKey)
                .build());
    }

    public Long objectSize(String fileKey) {
        try {
            return s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileKey)
                    .build()).contentLength();
        } catch (NoSuchKeyException e) {
            return null;
        }
    }

    public byte[] readHead(String fileKey, int maxBytes) {
        return s3Client.getObjectAsBytes(GetObjectRequest.builder()
                .bucket(bucket)
                .key(fileKey)
                .range("bytes=0-" + (maxBytes - 1))
                .build()).asByteArray();
    }
}
