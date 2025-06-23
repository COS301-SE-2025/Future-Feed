package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TopicRepository extends JpaRepository<Topic, Integer> {
    boolean existsByName(String name);
}