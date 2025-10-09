package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.BookmarkDto;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Bookmark;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.BookmarkRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepo;
    private final AppUserRepository userRepo;
    private final PostRepository postRepo;
    private final NotificationService notificationService;

    public BookmarkService(BookmarkRepository bookmarkRepo,
                           AppUserRepository userRepo,
                           PostRepository postRepo,
                           NotificationService notificationService) {
        this.bookmarkRepo = bookmarkRepo;
        this.userRepo = userRepo;
        this.postRepo = postRepo;
        this.notificationService = notificationService;
    }

    private AppUser getAuthenticatedUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
        throw new RuntimeException("User not authenticated");
    }

    // --- Case 1: OAuth2 login (e.g., Google) ---
    if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");

        if (email == null) {
            throw new RuntimeException("Email not found in OAuth2 attributes");
        }

        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated OAuth2 user not found in DB"));
    }

    // --- Case 2: Manual login (form login / username-password) ---
    Object principal = authentication.getPrincipal();
    String usernameOrEmail;

    if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
        usernameOrEmail = userDetails.getUsername(); // Spring stores username here
    } else if (principal instanceof String strPrincipal) {
        usernameOrEmail = strPrincipal;
    } else {
        throw new RuntimeException("Unsupported authentication principal type: " + principal.getClass());
    }

    // Try lookup by email first, fallback to username
    return userRepo.findByEmail(usernameOrEmail)
            .or(() -> userRepo.findByUsername(usernameOrEmail))
            .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB"));
}


    public List<Post> getBookmarkedPosts() {
        AppUser user = getAuthenticatedUser();
        List<Bookmark> bookmarks = bookmarkRepo.findByUser(user);

        return bookmarks.stream()
                .map(Bookmark::getPost)
                .distinct()
                .toList();
    }

    public boolean addBookmark(Integer userId, Integer postId) {
        AppUser user = userRepo.findById(userId).orElseThrow();
        Post post = postRepo.findById(postId).orElseThrow();

        if (bookmarkRepo.findByUserAndPost(user, post).isPresent()) return false;

        bookmarkRepo.save(new Bookmark(user, post));

        if (post instanceof UserPost userPost) {
            AppUser owner = userPost.getUser(); // may be null
            if (owner != null) {
                Integer recipientId = owner.getId();
                if (!recipientId.equals(user.getId())) {
                    notificationService.createNotification(
                            recipientId,
                            user.getId(),
                            "BOOKMARK",
                            " added your post to bookmarks",
                            user.getUsername() + "",
                            postId
                    );
                }
            }
        }
        return true;
    }

    public boolean removeBookmark(Integer userId, Integer postId) {
        AppUser user = userRepo.findById(userId).orElseThrow();
        Post post = postRepo.findById(postId).orElseThrow();

        if (post instanceof UserPost userPost) {
            AppUser owner = userPost.getUser(); // may be null
            if (owner != null) {
                Integer recipientId = owner.getId();
                if (!recipientId.equals(user.getId())) {
                    notificationService.createNotification(
                            recipientId,
                            user.getId(),
                            "BOOKMARK REMOVED",
                            " removed your post from bookmarks",
                            user.getUsername() + "",
                            postId
                    );
                }
            }
        }

        return bookmarkRepo.findByUserAndPost(user, post)
                .map(b -> {
                    bookmarkRepo.delete(b);
                    return true;
                })
                .orElse(false);
    }

    public List<Bookmark> getUserBookmarks(Integer userId) {
        AppUser user = userRepo.findById(userId).orElseThrow();
        return bookmarkRepo.findByUser(user);
    }

    public List<BookmarkDto> getUserBookmarkDtos(Integer userId) {
        AppUser user = userRepo.findById(userId).orElseThrow();
        List<Bookmark> bookmarks = bookmarkRepo.findByUser(user);

        return bookmarks.stream()
                .map(bookmark -> {
                    Post post = bookmark.getPost();

                    return new BookmarkDto(
                            post.getId(),
                            post.getContent(),
                            "USER_POST",
                            post.getCreatedAt()
                    );
                })
                .toList();
    }

    public boolean isBookmarked(Integer userId, Integer postId) {
        AppUser user = userRepo.findById(userId).orElseThrow();
        Post post = postRepo.findById(postId).orElseThrow();
        return bookmarkRepo.findByUserAndPost(user, post).isPresent();
    }

    public List<Post> getBookmarkedPostsByUserId(Integer userId) {
        AppUser user = userRepo.findById(userId).orElseThrow();
        List<Bookmark> bookmarks = bookmarkRepo.findByUser(user);
        return bookmarks.stream()
                .map(Bookmark::getPost)
                .distinct()
                .toList();
    }
}
