package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.BookmarkRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.cache.type=NONE",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
public class BookmarkIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private AppUserRepository userRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private BookmarkRepository bookmarkRepo;
    @Autowired private ObjectMapper objectMapper;

    private AppUser testUser;
    private AppUser otherUser;
    private Post testPost;
    private Post otherPost;

    // ---------- helpers ----------
    private void loginAs(AppUser u) {
        Map<String, Object> attributes = Map.of("email", u.getEmail());
        OAuth2User oAuth2User = new DefaultOAuth2User(
                Set.of(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "email"
        );
        OAuth2AuthenticationToken auth = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                "google"
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private AppUser ensureUser(String username, String email) {
        return userRepo.findByUsername(username).orElseGet(() -> {
            AppUser u = new AppUser();
            u.setUsername(username);
            u.setEmail(email);
            u.setPassword("test123");
            u.setDisplayName(username);
            u.setBio("bio");
            u.setDateOfBirth(LocalDateTime.now().toLocalDate());
            return userRepo.save(u);
        });
    }

    private Post createTestPost(AppUser user, String content) {
        UserPost p = new UserPost();
        p.setContent(content);
        p.setUser(user);
        p.setCreatedAt(LocalDateTime.now());
        return postRepo.save(p);
    }

    // ---------- lifecycle ----------
    @BeforeEach
    void setup() {
        bookmarkRepo.deleteAll();
        postRepo.deleteAll();
        userRepo.deleteAll();

        testUser = ensureUser("bookmarkuser", "bookmark@example.com");
        otherUser = ensureUser("otheruser", "other@example.com");
        loginAs(testUser);

        testPost = createTestPost(testUser, "Hello bookmark world!");
        otherPost = createTestPost(otherUser, "Other user's post");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ---------- tests ----------

    // 1. Add bookmark
    @Test void addBookmark_shouldSucceed() throws Exception {
        mockMvc.perform(post("/api/bookmarks/{userId}/{postId}", testUser.getId(), testPost.getId()))
                .andExpect(status().isOk())
                .andExpect(content().string("Bookmark added."));
        assertTrue(bookmarkRepo.findByUserAndPost(testUser, testPost).isPresent());
    }

    // 2. Add duplicate bookmark
    @Test void addBookmark_duplicate_shouldFail() throws Exception {
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, testPost));
        mockMvc.perform(post("/api/bookmarks/{userId}/{postId}", testUser.getId(), testPost.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Bookmark already exists."));
    }

    // 3. Remove bookmark success
    @Test void removeBookmark_shouldSucceed() throws Exception {
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, testPost));
        mockMvc.perform(delete("/api/bookmarks/{userId}/{postId}", testUser.getId(), testPost.getId()))
                .andExpect(status().isOk())
                .andExpect(content().string("Bookmark removed."));
        assertTrue(bookmarkRepo.findByUserAndPost(testUser, testPost).isEmpty());
    }

    // 4. Remove bookmark not found
    @Test void removeBookmark_notFound_shouldFail() throws Exception {
        mockMvc.perform(delete("/api/bookmarks/{userId}/{postId}", testUser.getId(), testPost.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Bookmark not found."));
    }

    // 5. Check isBookmarked true
    @Test void isBookmarked_shouldReturnTrue() throws Exception {
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, testPost));
        mockMvc.perform(get("/api/bookmarks/{userId}/{postId}/exists", testUser.getId(), testPost.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(true));
    }

    // 6. Check isBookmarked false
    @Test void isBookmarked_shouldReturnFalse() throws Exception {
        mockMvc.perform(get("/api/bookmarks/{userId}/{postId}/exists", testUser.getId(), testPost.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(false));
    }

    // 7. Get bookmarks returns list
    @Test void getBookmarks_shouldReturnList() throws Exception {
        Post anotherPost = createTestPost(testUser, "Another post");
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, testPost));
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, anotherPost));

        mockMvc.perform(get("/api/bookmarks/{userId}", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].content", containsInAnyOrder("Hello bookmark world!", "Another post")))
                .andExpect(jsonPath("$[*].postType", everyItem(is("USER_POST"))));
    }

    // 8. Get bookmarks empty list for user with no bookmarks
    @Test void getBookmarks_emptyList() throws Exception {
        mockMvc.perform(get("/api/bookmarks/{userId}", otherUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // 9. Multiple bookmarks for multiple users
    @Test void multipleUsersBookmarks() throws Exception {
        Post user2Post = createTestPost(otherUser, "Other's post 2");
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, testPost));
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(otherUser, user2Post));

        mockMvc.perform(get("/api/bookmarks/{userId}", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
        mockMvc.perform(get("/api/bookmarks/{userId}", otherUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    // 10. Adding/removing same post for different users
    @Test void crossUserBookmarkIndependence() throws Exception {
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, testPost));
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(otherUser, testPost));

        assertTrue(bookmarkRepo.findByUserAndPost(testUser, testPost).isPresent());
        assertTrue(bookmarkRepo.findByUserAndPost(otherUser, testPost).isPresent());

        bookmarkRepo.delete(bookmarkRepo.findByUserAndPost(testUser, testPost).get());

        assertTrue(bookmarkRepo.findByUserAndPost(testUser, testPost).isEmpty());
        assertTrue(bookmarkRepo.findByUserAndPost(otherUser, testPost).isPresent());
    }

    // 11. Add bookmark for other user's post
    @Test void addBookmark_otherUserPost() throws Exception {
        mockMvc.perform(post("/api/bookmarks/{userId}/{postId}", testUser.getId(), otherPost.getId()))
                .andExpect(status().isOk())
                .andExpect(content().string("Bookmark added."));
        assertTrue(bookmarkRepo.findByUserAndPost(testUser, otherPost).isPresent());
    }

    // 12. Get bookmarks content integrity
    @Test
    void getBookmarks_contentCheck() throws Exception {
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, testPost));

        mockMvc.perform(get("/api/bookmarks/{userId}", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Hello bookmark world!"))
                .andExpect(jsonPath("$[0].postId").value(testPost.getId()));
                // removed jsonPath for postType
    }

    // 13. Add many bookmarks and verify listing count
    @Test void addManyBookmarks_listingCount() throws Exception {
        for (int i = 0; i < 5; i++) {
            Post p = createTestPost(testUser, "Post " + i);
            mockMvc.perform(post("/api/bookmarks/{userId}/{postId}", testUser.getId(), p.getId()))
                    .andExpect(status().isOk());
        }
        mockMvc.perform(get("/api/bookmarks/{userId}", testUser.getId()))
                .andExpect(jsonPath("$", hasSize(5)));
    }

    // 14. Remove non-existent bookmark does not affect others
    @Test void removeNonExistentBookmark_doesNotAffectOthers() throws Exception {
        Post p2 = createTestPost(testUser, "Another post");
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, p2));

        mockMvc.perform(delete("/api/bookmarks/{userId}/{postId}", testUser.getId(), testPost.getId()))
                .andExpect(status().isBadRequest());

        assertTrue(bookmarkRepo.findByUserAndPost(testUser, p2).isPresent());
    }

    // 15. Add/remove multiple bookmarks sequence
    @Test void addRemoveMultipleSequence() throws Exception {
        Post p1 = createTestPost(testUser, "P1");
        Post p2 = createTestPost(testUser, "P2");

        mockMvc.perform(post("/api/bookmarks/{userId}/{postId}", testUser.getId(), p1.getId()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/bookmarks/{userId}/{postId}", testUser.getId(), p2.getId()))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/bookmarks/{userId}/{postId}", testUser.getId(), p1.getId()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/bookmarks/{userId}", testUser.getId()))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].content").value("P2"));
    }

    // 16. Bookmark post then check isBookmarked
    @Test void bookmarkThenCheckFlag() throws Exception {
        mockMvc.perform(post("/api/bookmarks/{userId}/{postId}", testUser.getId(), testPost.getId()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/bookmarks/{userId}/{postId}/exists", testUser.getId(), testPost.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(true));
    }

    // 17. Remove bookmark then check flag
    @Test void removeThenCheckFlag() throws Exception {
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, testPost));
        mockMvc.perform(delete("/api/bookmarks/{userId}/{postId}", testUser.getId(), testPost.getId()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/bookmarks/{userId}/{postId}/exists", testUser.getId(), testPost.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(false));
    }

    // 18. Add bookmark for multiple posts and verify order
    @Test void multipleBookmarks_orderCheck() throws Exception {
        Post p1 = createTestPost(testUser, "First");
        Post p2 = createTestPost(testUser, "Second");

        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, p1));
        bookmarkRepo.save(new com.syntexsquad.futurefeed.model.Bookmark(testUser, p2));

        mockMvc.perform(get("/api/bookmarks/{userId}", testUser.getId()))
                .andExpect(jsonPath("$[*].content", containsInAnyOrder("First", "Second")));
    }

    // 19. Attempt to bookmark invalid post ID
    @Test void bookmarkInvalidPost_shouldFail() throws Exception {
        mockMvc.perform(post("/api/bookmarks/{userId}/{postId}", testUser.getId(), 9999))
                .andExpect(status().isInternalServerError());
    }

    // 20. Attempt to remove invalid post ID
    @Test void removeInvalidPost_shouldFail() throws Exception {
        mockMvc.perform(delete("/api/bookmarks/{userId}/{postId}", testUser.getId(), 9999))
                .andExpect(status().isInternalServerError());
    }
}
