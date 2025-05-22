package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Integer> {
}
