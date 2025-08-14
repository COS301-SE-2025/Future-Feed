package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Bot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BotRepository extends JpaRepository<Bot, Integer> {
    List<Bot> findByOwnerId(Integer ownerId);

    @Query("SELECT b FROM Bot b WHERE b.isActive = true")
    List<Bot> findByActiveTrue();

}
