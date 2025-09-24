package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.FeedPreset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.List;

public interface FeedPresetRepository extends JpaRepository<FeedPreset, Integer> {
    List<FeedPreset> findByUserId(Integer userId);
    Optional<FeedPreset> findByUserIdAndDefaultPresetTrue(Integer userId);
    @Modifying
    @Query("UPDATE FeedPreset p SET p.defaultPreset = false WHERE p.userId = :userId")
    void unsetDefaultPresets(Integer userId);

}

