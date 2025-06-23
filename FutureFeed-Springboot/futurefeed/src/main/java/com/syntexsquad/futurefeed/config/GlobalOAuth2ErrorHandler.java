package com.syntexsquad.futurefeed.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

@ControllerAdvice
public class GlobalOAuth2ErrorHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalOAuth2ErrorHandler.class);

    @ExceptionHandler(OAuth2AuthenticationException.class)
    @ResponseBody
    public ResponseEntity<String> handleOAuth2Exception(OAuth2AuthenticationException ex) {
        log.error("OAuth2 Authentication Failed: {}", ex.getError().getDescription(), ex);
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("OAuth2 Error: " + ex.getError().getDescription());
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<String> handleGeneral(Exception ex) {
        log.error("General error during login: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Server Error: " + ex.getMessage());
    }
}

