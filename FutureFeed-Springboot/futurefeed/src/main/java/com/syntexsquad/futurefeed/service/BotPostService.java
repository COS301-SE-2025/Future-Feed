package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.model.BotPosts;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.repository.BotPostRepository;
import com.syntexsquad.futurefeed.repository.BotRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BotPostService {

    @Autowired
    private BotPostRepository botPostRepository;

    @Autowired
    private BotRepository botRepository;

    @Autowired
    private PostRepository postRepository;

    public BotPosts linkBotToPost(Integer botId, Integer postId) {
        Bot bot = botRepository.findById(botId)
                .orElseThrow(() -> new RuntimeException("Bot not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        BotPosts botPost = new BotPosts();
        botPost.setBot(bot);
        botPost.setPost(post);

        return botPostRepository.save(botPost);
    }

    public List<BotPosts> getPostsByBot(Integer botId) {
        return botPostRepository.findByBotId(botId);
    }
}
