package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.CommentRequest;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {
    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public Comment addComment(CommentRequest request) {
        Comment comment = new Comment();
        comment.setUserId(request.getUserId());
        comment.setPostId(request.getPostId());
        comment.setContent(request.getContent());
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsForPost(Integer postId) {
        return commentRepository.findByPostId(postId);
    }
}
