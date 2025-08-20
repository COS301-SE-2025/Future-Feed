package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.FollowStatusResponse;
import com.syntexsquad.futurefeed.dto.FollowedUserDto;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Follower;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.FollowerRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FollowService {

    private final FollowerRepository followerRepository;
    private final AppUserRepository appUserRepository;

    public FollowService(FollowerRepository followerRepository, AppUserRepository appUserRepository) {
        this.followerRepository = followerRepository;
        this.appUserRepository = appUserRepository;
    }
    public List<FollowedUserDto> getTopFollowedUsers(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Object[]> results = followerRepository.findTopFollowedUsers(pageable);

        return results.stream().map(obj -> {
            AppUser user = (AppUser) obj[0];
            Long  count = (Long) obj[1];
            return new FollowedUserDto(user.getId(), user.getUsername(), user.getDisplayName(), user.getProfilePicture(), count);
        }).toList();
    }
    private AppUser getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2User oAuth2User = oauthToken.getPrincipal();
            String email = (String) oAuth2User.getAttributes().get("email");
            return appUserRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB"));
        }
        throw new RuntimeException("User not authenticated");
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
                    null  // No postId needed for follow notification
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
                null  // No postId needed for follow notification
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
