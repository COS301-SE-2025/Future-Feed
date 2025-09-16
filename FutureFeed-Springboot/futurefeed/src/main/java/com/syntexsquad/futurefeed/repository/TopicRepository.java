package com.syntexsquad.futurefeed.repository;
import java.util.Optional;
import com.syntexsquad.futurefeed.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TopicRepository extends JpaRepository<Topic, Integer> {
    boolean existsByName(String name);
    Optional<Topic> findByName(String name);
    @Query("SELECT t FROM Topic t WHERE LOWER(t.name) = LOWER(:name)")
    Optional<Topic> findByNameIgnoreCase(@Param("name") String name);
}