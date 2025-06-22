package com.syntexsquad.futurefeed.repository;
import com.syntexsquad.futurefeed.model.FeedPreset;
import  com.syntexsquad.futurefeed.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedPresetRepository extends JpaRepository<FeedPreset, Long> {
    List<FeedPreset> findByOwner(AppUser user);
}