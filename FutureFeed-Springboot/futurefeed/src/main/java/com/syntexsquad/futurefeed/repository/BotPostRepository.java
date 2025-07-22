package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.BotPosts;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BotPostRepository extends JpaRepository<BotPosts, Integer> {
    List<BotPosts> findByBotId(Integer botId);
}
