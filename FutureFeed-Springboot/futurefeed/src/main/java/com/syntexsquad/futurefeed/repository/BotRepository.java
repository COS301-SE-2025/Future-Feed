package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Bot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BotRepository extends JpaRepository<Bot, Integer> {
    List<Bot> findByOwnerId(Integer ownerId);
}
