package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public Post createPost(com.syntexsquad.futurefeed.dto.PostRequest postRequest) {
        Post post = new Post();
        post.setUserId(postRequest.getUserId());
        post.setContent(postRequest.getContent());
        post.setImageUrl(postRequest.getImageUrl());
        post.setIsBot(postRequest.getIsBot() != null ? postRequest.getIsBot() : false);
        return postRepository.save(post);
    }

    // ✅ This method must return void
    public void deletePost(Integer postId) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found");
        }
        postRepository.deleteById(postId);
    }
}

