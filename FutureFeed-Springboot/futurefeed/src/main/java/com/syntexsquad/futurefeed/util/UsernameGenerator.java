package com.syntexsquad.futurefeed.util;

import com.syntexsquad.futurefeed.repository.AppUserRepository;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

@Component
public class UsernameGenerator {

    private final AppUserRepository userRepository;

    public UsernameGenerator(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Generate a unique username based on a preferred name.
     * Examples:
     *   "Oarabile Matlala" -> "oarabilematlala"
     *   If taken -> "oarabilematlala1", "oarabilematlala2", etc.
     */
    public String generateUniqueUsername(String preferredName) {
        String base = toSlug(preferredName);
        String candidate = base;
        int counter = 1;

        // keep checking until a free username is found
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + counter;
            counter++;
        }

        return candidate;
    }

    // Remove spaces, accents, special characters -> safe username
    private String toSlug(String input) {
        String nowhitespace = input.trim().replaceAll("\\s+", "").toLowerCase(Locale.ROOT);
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        Pattern nonAscii = Pattern.compile("[^a-z0-9]");
        return nonAscii.matcher(normalized).replaceAll("");
    }
}
