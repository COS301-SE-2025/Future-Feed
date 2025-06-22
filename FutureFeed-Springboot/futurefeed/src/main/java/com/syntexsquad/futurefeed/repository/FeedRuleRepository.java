package com.syntexsquad.futurefeed.repository;
import com.syntexsquad.futurefeed.model.FeedRule;
import org.springframework.data.jpa.repository.JpaRepository; 
import java.util.List;

public interface FeedRuleRepository extends JpaRepository<FeedRule, Long> {
    List<FeedRule> findByFeedPresetId(Long presetId);
}
  