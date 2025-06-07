package com.syntexsquad.futurefeed.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalOAuth2ErrorHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalOAuth2ErrorHandler.class);

    @ExceptionHandler(OAuth2AuthenticationException.class)
    public String handleOAuth2Exception(OAuth2AuthenticationException ex) {
        log.error("OAuth2 Authentication Failed: {}", ex.getError().getDescription(), ex);
        return "redirect:/login?error=oauth2";
    }

    @ExceptionHandler(Exception.class)
    public String handleGeneral(Exception ex) {
        log.error("General error during login: {}", ex.getMessage(), ex);
        return "redirect:/login?error=general";
    }
}
