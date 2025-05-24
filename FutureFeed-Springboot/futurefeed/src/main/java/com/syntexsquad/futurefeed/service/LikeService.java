package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.Like;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import org.springframework.stereotype.Service;

@Service
public class LikeService {
    private final LikeRepository likeRepository;

    public LikeService(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    public boolean likePost(Integer userId, Integer postId) {
        if (likeRepository.existsByUserIdAndPostId(userId, postId)) {
            return false;
        }
        Like like = new Like();
        like.setUserId(userId);
        like.setPostId(postId);
        likeRepository.save(like);
        return true;
    }

    public boolean unlikePost(Integer userId, Integer postId) {
        if (!likeRepository.existsByUserIdAndPostId(userId, postId)) {
            return false;
        }
        likeRepository.deleteByUserIdAndPostId(userId, postId);
        return true;
    }

    public long countLikes(Integer postId) {
        return likeRepository.countByPostId(postId);
    }
}
