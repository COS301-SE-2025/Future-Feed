package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.repository.PostRepository;
import org.springframework.stereotype.Service;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public Post createPost(PostRequest postRequest) {
        Post post = new Post();
        post.setUserId(postRequest.getUserId());
        post.setContent(postRequest.getContent());
        post.setImageUrl(postRequest.getImageUrl());
        post.setIsBot(postRequest.getIsBot() != null ? postRequest.getIsBot() : false);
        return postRepository.save(post);
    }

    public boolean deletePost(Integer id) {
        if (!postRepository.existsById(id)) {
            return false;
        }
        postRepository.deleteById(id);
        return true;
    }
}
