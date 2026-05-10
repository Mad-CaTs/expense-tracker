package com.expenses.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

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
        var putRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(fileKey)
                .contentType(contentType)
                .build();
        var presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(expiration)
                .putObjectRequest(putRequest)
                .build();
        return presigner.presignPutObject(presignRequest).url().toString();
    }

    public String generateDownloadUrl(String fileKey, String fileName, Duration expiration) {
        var disposition = "attachment; filename=\"" + fileName.replace("\"", "") + "\"";
        var getRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(fileKey)
                .responseContentDisposition(disposition)
                .build();
        var presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(expiration)
                .getObjectRequest(getRequest)
                .build();
        return presigner.presignGetObject(presignRequest).url().toString();
    }

    public void deleteObject(String fileKey) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(fileKey)
                .build());
    }
}
