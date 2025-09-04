package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Bookmark;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUser(AppUser user);
    Optional<Bookmark> findByUserAndPost(AppUser user, Post post);
}
