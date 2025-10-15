// local
package com.syntexsquad.futurefeed.config;

import com.syntexsquad.futurefeed.service.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class SecurityConfig {

private final CustomOAuth2UserService customOAuth2UserService;

public SecurityConfig(CustomOAuth2UserService customOAuth2UserService) {
    this.customOAuth2UserService = customOAuth2UserService;
}

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .cors() 
        .and()
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                "/",
                "/home",
                "/login",
                "/login/**",
                "/login/oauth2/**",
                "/oauth2/**",
                "/api/auth/**",
                "/css/**",
                "/js/**",
                "/images/**"
            ).permitAll()
            .anyRequest().authenticated()
        )
        .csrf(csrf -> csrf
            .ignoringRequestMatchers("/api/**")
        )

        .formLogin(form -> form
            .loginProcessingUrl("/api/auth/login") 
            .successHandler((req, res, auth) -> res.setStatus(HttpServletResponse.SC_OK))
            .failureHandler((req, res, ex) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Bad credentials"))
            .permitAll()
        )

        .oauth2Login(oauth2 -> oauth2
            .defaultSuccessUrl("http://localhost:5173/home", true)
            .userInfoEndpoint(userInfo -> userInfo
                .userService(customOAuth2UserService)
            )
        )
        .logout(logout -> logout
            .logoutUrl("/api/auth/logout")
            .invalidateHttpSession(true)
            .clearAuthentication(true)
            .deleteCookies("JSESSIONID")
            .logoutSuccessHandler((request, response, authentication) -> {
                response.setStatus(200);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"logged out\"}");
            })
        )

        .exceptionHandling(ex -> ex
            .defaultAuthenticationEntryPointFor(
                (req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED),
                new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/**")
            )
        );

    return http.build();
}

@Bean
public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowCredentials(true);
    config.setAllowedOrigins(List.of("http://localhost:5173"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
}

@Bean
public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
}

@Bean
public org.springframework.security.core.userdetails.UserDetailsService userDetailsService(
        com.syntexsquad.futurefeed.repository.AppUserRepository repo) {
    return username -> repo.findByUsername(username)
        .map(com.syntexsquad.futurefeed.security.AppUserDetails::new)
        .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + username));
}

@Bean
public static PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}


}

/*
// production
package com.syntexsquad.futurefeed.config;

import com.syntexsquad.futurefeed.service.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class SecurityConfig {

private final CustomOAuth2UserService customOAuth2UserService;
private final String frontendUrl;

public SecurityConfig(
        CustomOAuth2UserService customOAuth2UserService,
        @Value("${app.frontend-url:https://future-feed.vercel.app}") String frontendUrl
) {
    this.customOAuth2UserService = customOAuth2UserService;
    this.frontendUrl = frontendUrl;
}

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .cors().and()
        .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**", "/h2-console/**"))
        .headers(h -> h.frameOptions(f -> f.sameOrigin()))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                "/", "/home",
                "/login", "/login/**", "/login/oauth2/**",
                "/oauth2/**", "/api/auth/**",
                "/h2-console/**", "/actuator/health",
                "/css/**", "/js/**", "/images/**"
            ).permitAll()
            .anyRequest().authenticated()
        )

        // === Manual local login (SESSION) added ===
        .formLogin(form -> form
            .loginProcessingUrl("/api/auth/login") // POST form-encoded: username, password
            .successHandler((req, res, auth) -> res.setStatus(HttpServletResponse.SC_OK))
            .failureHandler((req, res, ex) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Bad credentials"))
            .permitAll()
        )

        .oauth2Login(oauth2 -> oauth2
            .defaultSuccessUrl(frontendUrl + "/home", true)
            .userInfoEndpoint(u -> u.userService(customOAuth2UserService))
        )
        .logout(logout -> logout
            .logoutUrl("/api/auth/logout")
            .invalidateHttpSession(true)
            .clearAuthentication(true)
            .deleteCookies("JSESSIONID")
            .logoutSuccessHandler((request, response, authentication) -> {
                response.setStatus(200);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"logged out\"}");
            })
        )

        .exceptionHandling(ex -> ex
            .defaultAuthenticationEntryPointFor(
                (req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED),
                new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/**")
            )
        );
    return http.build();
}

@Bean
public static PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

@Bean
public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
    return cfg.getAuthenticationManager();
}

// Needed so Spring can authenticate username/password against your DB
@Bean
public org.springframework.security.core.userdetails.UserDetailsService userDetailsService(
        com.syntexsquad.futurefeed.repository.AppUserRepository repo) {
    return username -> repo.findByUsername(username)
        .map(com.syntexsquad.futurefeed.security.AppUserDetails::new)
        .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + username));
}

@Bean
public CorsFilter corsFilter(@Value("${app.frontend-url:https://future-feed.vercel.app}") String fe) {
    CorsConfiguration cfg = new CorsConfiguration();
    cfg.setAllowCredentials(true);
    cfg.setAllowedOrigins(List.of("http://localhost:5173", fe));
    cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    cfg.setAllowedHeaders(List.of("Authorization","Content-Type","X-Requested-With","Accept")); // kept as-is per your request
    cfg.setExposedHeaders(List.of("Set-Cookie"));

    UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/**", cfg);
    return new CorsFilter(src);
}


}
*/