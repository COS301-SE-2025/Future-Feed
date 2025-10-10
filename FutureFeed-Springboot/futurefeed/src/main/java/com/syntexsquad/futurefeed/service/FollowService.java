package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.FollowStatusResponse;
import com.syntexsquad.futurefeed.dto.FollowedUserDto;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Follower;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.FollowerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class FollowService {

    private static final Logger log = LoggerFactory.getLogger(FollowService.class);

    private final FollowerRepository followerRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    public FollowService(FollowerRepository followerRepository,
                         AppUserRepository appUserRepository,
                         NotificationService notificationService) {
        this.followerRepository = followerRepository;
        this.appUserRepository = appUserRepository;
        this.notificationService = notificationService;
    }

    // ---------- unified user resolution (OAuth2 + DAO) ----------
    private AppUser getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new RuntimeException("User not authenticated");

        // 1) OAuth2 (Google, etc.)
        if (auth instanceof OAuth2AuthenticationToken oauth) {
            OAuth2User principal = oauth.getPrincipal();
            if (principal != null) {
                Map<String, Object> attrs = principal.getAttributes();
                Object emailAttr = attrs == null ? null : attrs.get("email");
                if (emailAttr != null) {
                    String email = String.valueOf(emailAttr);
                    return appUserRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB (email=" + email + ")"));
                }
            }
        }

        // 2) Try custom AppUserDetails via reflection (optional, non-breaking)
        Object principal = auth.getPrincipal();
        try {
            Class<?> audClass = Class.forName("com.syntexsquad.futurefeed.security.AppUserDetails");
            if (audClass.isInstance(principal)) {
                Object aud = principal;
                try {
                    Integer id = (Integer) audClass.getMethod("getId").invoke(aud);
                    if (id != null) {
                        Optional<AppUser> byId = appUserRepository.findById(id);
                        if (byId.isPresent()) return byId.get();
                    }
                } catch (NoSuchMethodException ignored) {}

                try {
                    String email = String.valueOf(audClass.getMethod("getEmail").invoke(aud));
                    if (email != null && !email.isBlank()) {
                        Optional<AppUser> byEmail = appUserRepository.findByEmail(email);
                        if (byEmail.isPresent()) return byEmail.get();
                    }
                } catch (NoSuchMethodException ignored) {}

                try {
                    String username = String.valueOf(audClass.getMethod("getUsername").invoke(aud));
                    if (username != null && !username.isBlank()) {
                        return appUserRepository.findByEmail(username)
                                .or(() -> appUserRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("Authenticated user not found (username=" + username + ")"));
                    }
                } catch (NoSuchMethodException ignored) {}
            }
        } catch (ClassNotFoundException ignored) {
        } catch (Exception reflectErr) {
            log.warn("getAuthenticatedUser: AppUserDetails reflection error: {}", reflectErr.toString());
        }

        // 3) Generic Spring UserDetails
        if (principal instanceof UserDetails ud) {
            String name = ud.getUsername();
            if (name != null && !name.isBlank()) {
                return appUserRepository.findByEmail(name)
                        .or(() -> appUserRepository.findByUsername(name))
                        .orElseThrow(() -> new RuntimeException("Authenticated user not found (principal=" + name + ")"));
            }
        }

        // 4) Principal as plain String
        if (principal instanceof String s && !s.isBlank()) {
            return appUserRepository.findByEmail(s)
                    .or(() -> appUserRepository.findByUsername(s))
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found (principal=" + s + ")"));
        }

        // 5) Fallback: auth.getName()
        String fallback = auth.getName();
        if (fallback != null && !fallback.isBlank()) {
            return appUserRepository.findByEmail(fallback)
                    .or(() -> appUserRepository.findByUsername(fallback))
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found (name=" + fallback + ")"));
        }

        throw new RuntimeException("Could not extract authenticated user from security context");
    }
    // ------------------------------------------------------------

    public List<FollowedUserDto> getTopFollowedUsers(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Object[]> results = followerRepository.findTopFollowedUsers(pageable);

        return results.stream().map(obj -> {
            AppUser user = (AppUser) obj[0];
            Long count = (Long) obj[1];
            return new FollowedUserDto(
                    user.getId(),
                    user.getUsername(),
                    user.getDisplayName(),
                    user.getProfilePicture(),
                    count
            );
        }).toList();
    }

    public void follow(Integer followedId) {
        AppUser follower = getAuthenticatedUser();
        if (follower.getId().equals(followedId)) {
            throw new IllegalArgumentException("Cannot follow yourself.");
        }

        if (!followerRepository.existsByFollowerIdAndFollowedId(follower.getId(), followedId)) {
            Follower relation = new Follower();
            relation.setFollowerId(follower.getId());
            relation.setFollowedId(followedId);
            followerRepository.save(relation);

            notificationService.createNotification(
                    followedId,
                    follower.getId(),
                    "FOLLOW",
                    " started following you",
                    follower.getUsername() + "",
                    null
            );
        }
    }

    @Transactional
    public void unfollow(Integer followedId) {
        AppUser follower = getAuthenticatedUser();
        boolean exists = followerRepository.existsByFollowerIdAndFollowedId(follower.getId(), followedId);
        if (!exists) {
            throw new IllegalStateException("You are not following this user.");
        }
        followerRepository.deleteByFollowerIdAndFollowedId(follower.getId(), followedId);

        notificationService.createNotification(
                followedId,
                follower.getId(),
                "UNFOLLOW",
                "  unfollowed you",
                follower.getUsername() + "",
                null
        );
    }

    public FollowStatusResponse isFollowing(Integer followedId) {
        AppUser follower = getAuthenticatedUser();
        boolean exists = followerRepository.existsByFollowerIdAndFollowedId(follower.getId(), followedId);
        return new FollowStatusResponse(exists);
    }

    public List<Follower> getFollowersOf(Integer userId) {
        return followerRepository.findByFollowedId(userId);
    }

    public List<Follower> getFollowingOf(Integer userId) {
        return followerRepository.findByFollowerId(userId);
    }
}
