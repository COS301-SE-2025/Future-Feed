package com.syntexsquad.futurefeed.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
//import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;

@Configuration
public class S3Config {

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.accessKeyId}")
    private String accessKeyId;

    @Value("${aws.secretKey}")
    private String secretKey;

    @Bean
    public S3Client s3Client() {
        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKeyId, secretKey);

        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                .build();
    }
}