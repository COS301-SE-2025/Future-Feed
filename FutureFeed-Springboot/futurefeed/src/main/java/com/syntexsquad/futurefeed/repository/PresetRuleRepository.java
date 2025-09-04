package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.PresetRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PresetRuleRepository extends JpaRepository<PresetRule, Integer> {
    List<PresetRule> findByPresetId(Integer presetId);
}

