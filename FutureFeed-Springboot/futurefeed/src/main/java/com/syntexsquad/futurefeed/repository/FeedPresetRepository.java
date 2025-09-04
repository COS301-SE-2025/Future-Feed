package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.FeedPreset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedPresetRepository extends JpaRepository<FeedPreset, Integer> {
    List<FeedPreset> findByUserId(Integer userId);
}

