package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.Controller.AuthController;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.service.AppUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.Map.of;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(AuthControllerTest.TestSecurityConfig.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppUserService appUserService;

    @Test
    @WithAnonymousUser
    public void testMeReturns401IfNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Not authenticated"));
    }

    @Test
    public void testMeReturnsUserIfAuthenticated() throws Exception {
        Map<String, Object> attributes = of(
                "email", "test@example.com",
                "name", "Test User"
        );

        OAuth2User principal = new DefaultOAuth2User(
                Set.of(new OAuth2UserAuthority(attributes)),
                attributes,
                "email"
        );

        TestingAuthenticationToken auth = new TestingAuthenticationToken(principal, null);
        auth.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(auth);

        AppUser mockUser = new AppUser();
        mockUser.setEmail("test@example.com");
        mockUser.setUsername("TestUser");

        when(appUserService.findOrCreateUserByEmail("test@example.com", attributes)).thenReturn(mockUser);

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.username").value("TestUser"));

        SecurityContextHolder.clearContext();
    }

    @TestConfiguration
    static class TestSecurityConfig implements WebMvcConfigurer {

        @Bean
        public AuthenticationPrincipalArgumentResolver authenticationPrincipalArgumentResolver() {
            return new AuthenticationPrincipalArgumentResolver();
        }

        @Override
        public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
            resolvers.add(authenticationPrincipalArgumentResolver());
        }

        @Bean
        public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            http
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/me").permitAll() // ✅ Allow unauthenticated access
                    .anyRequest().authenticated()
                )
                .csrf().disable()
                .oauth2Login().disable()
                .formLogin().disable()
                .httpBasic().disable(); // Prevents redirects

            return http.build();
        }
    }
}
