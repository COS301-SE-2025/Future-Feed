package com.syntexsquad.futurefeed.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Base64;

@Service
public class MediaService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public MediaService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String key = "posts/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();

        s3Client.putObject(PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromBytes(file.getBytes()));

        return String.format("https://%s.s3.%s.amazonaws.com/%s",
                bucketName,
                s3Client.serviceClientConfiguration().region().id(),
                key);
    }

    public String uploadBytes(byte[] bytes, String contentType, String suggestedFileName) {
        String key = "posts/" + System.currentTimeMillis() + "_" +
                (suggestedFileName == null ? "generated.png" : suggestedFileName);

        s3Client.putObject(PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(contentType == null ? "image/png" : contentType)
                        .build(),
                RequestBody.fromBytes(bytes));

        return String.format("https://%s.s3.%s.amazonaws.com/%s",
                bucketName,
                s3Client.serviceClientConfiguration().region().id(),
                key);
    }

    public String uploadBase64Png(String b64, String suggestedFileName) {
        byte[] bytes = Base64.getDecoder().decode(b64);
        return uploadBytes(bytes, "image/png", suggestedFileName);
    }
}