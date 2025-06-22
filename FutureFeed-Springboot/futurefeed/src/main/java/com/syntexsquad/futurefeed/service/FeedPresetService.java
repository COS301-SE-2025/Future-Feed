package com.syntexsquad.futurefeed.service;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.FeedPreset;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.FeedPresetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedPresetService {
private final FeedPresetRepository feedPresetRepo;
private final AppUserRepository appUserRepo;

    public FeedPresetService(AppUserRepository appUserRepo, FeedPresetRepository feedPresetRepo) {
        this.appUserRepo = appUserRepo;
        this.feedPresetRepo = feedPresetRepo;
    }

    public FeedPreset createPreset(Long userId, FeedPreset preset){
    AppUser appUser = appUserRepo.findById(userId).orElseThrow();
    preset.setOwner(appUser);
    return feedPresetRepo.save(preset);
}
    public List<FeedPreset> getPresetsForUser(Long userId) {
        AppUser user = appUserRepo.findById(userId).orElseThrow();
        return feedPresetRepo.findByOwner(user);
    }

    public boolean activatePreset(long userId, long presetId)
    {
        AppUser user = appUserRepo.findById(userId).orElseThrow();
        FeedPreset preset = feedPresetRepo.findById(presetId).orElseThrow();
        if(preset.getOwner().equals(user))
        {
            List<FeedPreset> allPresets = feedPresetRepo.findByOwner(user);
            for (FeedPreset preset1 : allPresets) {
                preset1.setDefault(false);
            }
            preset.setDefault(true);
            feedPresetRepo.saveAll(allPresets);
            return  true;
        }
        return false;
    }
    public boolean deactivatePreset(long userId, long presetId)
    {
        AppUser user = appUserRepo.findById(userId).orElseThrow();
        FeedPreset preset = feedPresetRepo.findById(presetId).orElseThrow();
        if(preset.getOwner().equals(user))
        {
            List<FeedPreset> allPresets = feedPresetRepo.findByOwner(user);
            preset.setDefault(false);
            feedPresetRepo.saveAll(allPresets);
            return true;
        }
        return false;
    }
}
