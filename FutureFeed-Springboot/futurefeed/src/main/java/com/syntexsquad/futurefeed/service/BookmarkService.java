package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.BookmarkDto;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.*;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Bookmark;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.BookmarkRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepo;
    private final AppUserRepository userRepo;
    private final PostRepository postRepo;
    private final NotificationService notificationService;

    public BookmarkService(BookmarkRepository bookmarkRepo, AppUserRepository userRepo, PostRepository postRepo, NotificationService notificationService) {
        this.bookmarkRepo = bookmarkRepo;
        this.userRepo = userRepo;
        this.postRepo = postRepo;
        this.notificationService = notificationService;
    }

    public boolean addBookmark(Integer userId, Integer postId) {
        AppUser user = userRepo.findById(userId).orElseThrow();
        Post post = postRepo.findById(postId).orElseThrow();

        if (bookmarkRepo.findByUserAndPost(user, post).isPresent()) return false;

        bookmarkRepo.save(new Bookmark(user, post));

         if (post instanceof UserPost userPost) {
            Integer recipientId = userPost.getUser().getId();
            if (!recipientId.equals(user.getId())) {
                notificationService.createNotification(
                        recipientId,
                        user.getId(),
                        "BOOKMARK",
                        user.getUsername() + " added the your post to bookmark",
                        postId
                );
            }
        }
        return true;
    }

    public boolean removeBookmark(Integer userId, Integer postId) {
        AppUser user = userRepo.findById(userId).orElseThrow();
        Post post = postRepo.findById(postId).orElseThrow();
          if (post instanceof UserPost userPost) {
            Integer recipientId = userPost.getUser().getId();
            if (!recipientId.equals(user.getId())) {
                notificationService.createNotification(
                        recipientId,
                        user.getId(),
                        "BOOKMARK REMOVED",
                        user.getUsername() + " removed the your post from bookmark",
                        postId
                );
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

}
