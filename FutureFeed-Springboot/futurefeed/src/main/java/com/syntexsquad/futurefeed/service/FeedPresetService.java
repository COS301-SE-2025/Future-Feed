package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.FeedPresetDTO;
import com.syntexsquad.futurefeed.dto.PresetRuleDTO;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class FeedPresetService {

    private static final Logger log = LoggerFactory.getLogger(FeedPresetService.class);

    private final FeedPresetRepository presetRepo;
    private final PresetRuleRepository ruleRepo;
    private final AppUserRepository appUserRepository;
    private final PostRepository postRepository;
    private final PostTopicRepository postTopicRepository;

    public FeedPresetService(FeedPresetRepository presetRepo,
                             PresetRuleRepository ruleRepo,
                             AppUserRepository appUserRepository,
                             PostRepository postRepository,
                             PostTopicRepository postTopicRepository) {
        this.presetRepo = presetRepo;
        this.ruleRepo = ruleRepo;
        this.appUserRepository = appUserRepository;
        this.postRepository = postRepository;
        this.postTopicRepository = postTopicRepository;
    }

    // ---------- SAFE user resolution ----------
    /** Returns Optional<AppUser> safely for endpoints that must not 500. */
    private Optional<AppUser> tryGetCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return Optional.empty();

        // 1) OAuth2
        if (auth instanceof OAuth2AuthenticationToken oauth) {
            OAuth2User principal = oauth.getPrincipal();
            if (principal != null && principal.getAttributes() != null) {
                Object emailAttr = principal.getAttributes().get("email");
                if (emailAttr != null) {
                    String email = String.valueOf(emailAttr);
                    return appUserRepository.findByEmail(email);
                }
            }
        }

        // 2) Custom AppUserDetails (if present)
        Object principal = auth.getPrincipal();
        try {
            Class<?> audClass = Class.forName("com.syntexsquad.futurefeed.security.AppUserDetails");
            if (audClass.isInstance(principal)) {
                Object aud = principal;
                try {
                    Integer id = (Integer) audClass.getMethod("getId").invoke(aud);
                    if (id != null) {
                        Optional<AppUser> byId = appUserRepository.findById(id);
                        if (byId.isPresent()) return byId;
                    }
                } catch (NoSuchMethodException ignored) {}
                try {
                    String email = String.valueOf(audClass.getMethod("getEmail").invoke(aud));
                    if (email != null && !email.isBlank()) {
                        Optional<AppUser> byEmail = appUserRepository.findByEmail(email);
                        if (byEmail.isPresent()) return byEmail;
                    }
                } catch (NoSuchMethodException ignored) {}
                try {
                    String username = String.valueOf(audClass.getMethod("getUsername").invoke(aud));
                    if (username != null && !username.isBlank()) {
                        Optional<AppUser> byName = appUserRepository.findByEmail(username)
                                .or(() -> appUserRepository.findByUsername(username));
                        if (byName.isPresent()) return byName;
                    }
                } catch (NoSuchMethodException ignored) {}
            }
        } catch (ClassNotFoundException ignored) {
        } catch (Exception reflectErr) {
            log.warn("tryGetCurrentUser: AppUserDetails reflection error: {}", reflectErr.toString());
        }

        // 3) Generic Spring UserDetails
        if (principal instanceof UserDetails ud) {
            String name = ud.getUsername();
            if (name != null && !name.isBlank()) {
                Optional<AppUser> byName = appUserRepository.findByEmail(name)
                        .or(() -> appUserRepository.findByUsername(name));
                if (byName.isPresent()) return byName;
            }
        }

        // 4) Principal as String
        if (principal instanceof String s && !s.isBlank()) {
            Optional<AppUser> byName = appUserRepository.findByEmail(s)
                    .or(() -> appUserRepository.findByUsername(s));
            if (byName.isPresent()) return byName;
        }

        // 5) Fallback: auth.getName()
        String fallback = auth.getName();
        if (fallback != null && !fallback.isBlank()) {
            Optional<AppUser> byName = appUserRepository.findByEmail(fallback)
                    .or(() -> appUserRepository.findByUsername(fallback));
            if (byName.isPresent()) return byName;
        }

        return Optional.empty();
    }

    /** Legacy strict resolver (kept for callers/tests that expect exceptions). */
    private AppUser getAuthenticatedUser() {
        return tryGetCurrentUser()
                .orElseThrow(() -> new RuntimeException("Could not extract authenticated user from security context"));
    }
    // -------------------------------------------------------------------------

    // Used by /api/presets/default to avoid 500 and work for unauthenticated users
    public Optional<FeedPreset> findDefaultPresetForCurrentUser() {
        return tryGetCurrentUser()
                .map(AppUser::getId)
                .flatMap(uid -> presetRepo.findByUserIdAndDefaultPresetTrue(uid));
    }

    private int clampPercent(Integer p) {
        if (p == null) return 0;
        return Math.max(0, Math.min(100, p));
    }

    private void ensureTotalPercentWithin100(Integer presetId, Integer newRulePercent, Integer excludeRuleId) {
        int sum = ruleRepo.findByPresetId(presetId).stream()
                .filter(r -> excludeRuleId == null || !r.getId().equals(excludeRuleId))
                .map(r -> clampPercent(r.getPercentage()))
                .mapToInt(Integer::intValue)
                .sum();
        int total = sum + clampPercent(newRulePercent);
        if (total > 100) {
            throw new RuntimeException("Total percentage for preset " + presetId + " exceeds 100 (" + total + "%).");
        }
    }

    // ---------------- Preset CRUD ----------------

    public FeedPreset createPreset(FeedPresetDTO dto) {
        FeedPreset preset = new FeedPreset();
        preset.setName(dto.getName());
        preset.setDefaultPreset(dto.isDefaultPreset());
        preset.setUserId(getAuthenticatedUser().getId());
        return presetRepo.save(preset);
    }

    public List<FeedPreset> getUserPresets() {
        return presetRepo.findByUserId(getAuthenticatedUser().getId());
    }

    public FeedPreset updatePreset(Integer presetId, FeedPresetDTO dto) {
        FeedPreset preset = presetRepo.findById(presetId)
                .orElseThrow(() -> new RuntimeException("Preset not found"));

        if (!preset.getUserId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("Not authorized to update this preset");
        }

        preset.setName(dto.getName());
        preset.setDefaultPreset(dto.isDefaultPreset());
        return presetRepo.save(preset);
    }

    public void deletePreset(Integer presetId) {
        FeedPreset preset = presetRepo.findById(presetId)
                .orElseThrow(() -> new RuntimeException("Preset not found"));

        if (!preset.getUserId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("Not authorized to delete this preset");
        }

        ruleRepo.deleteByPresetId(presetId);
        presetRepo.delete(preset);
    }

    public void setDefaultPreset(Integer presetId) {
        FeedPreset preset = presetRepo.findById(presetId)
                .orElseThrow(() -> new RuntimeException("Preset not found"));

        Integer userId = getAuthenticatedUser().getId();
        if (!preset.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this preset");
        }

        List<FeedPreset> userPresets = presetRepo.findByUserId(userId);
        for (FeedPreset p : userPresets) {
            if (p.isDefaultPreset()) {
                p.setDefaultPreset(false);
                presetRepo.save(p);
            }
        }

        preset.setDefaultPreset(true);
        presetRepo.save(preset);
    }

    /** Strict variant retained for compatibility with any existing callers. */
    public FeedPreset getDefaultPreset() {
        Integer userId = getAuthenticatedUser().getId();
        return presetRepo.findByUserIdAndDefaultPresetTrue(userId)
                .orElseThrow(() -> new RuntimeException("No default preset found for this user"));
    }

    // ---------------- Rule CRUD ----------------

    public PresetRule createRule(PresetRuleDTO dto) {
        if (dto.getPresetId() == null) {
            throw new RuntimeException("presetId is required");
        }
        ensureTotalPercentWithin100(dto.getPresetId(), dto.getPercentage(), null);

        PresetRule rule = new PresetRule();
        rule.setPresetId(dto.getPresetId());
        rule.setTopicId(dto.getTopicId());
        rule.setSourceType(dto.getSourceType());
        rule.setSpecificUserId(dto.getSpecificUserId());
        rule.setPercentage(clampPercent(dto.getPercentage()));
        return ruleRepo.save(rule);
    }

    public List<PresetRule> getRulesForPreset(Integer presetId) {
        return ruleRepo.findByPresetId(presetId);
    }

    public PresetRule updateRule(Integer ruleId, PresetRuleDTO dto) {
        PresetRule rule = ruleRepo.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        FeedPreset preset = presetRepo.findById(rule.getPresetId())
                .orElseThrow(() -> new RuntimeException("Preset not found"));
        if (!preset.getUserId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("Not authorized to update this rule");
        }

        ensureTotalPercentWithin100(rule.getPresetId(), dto.getPercentage(), ruleId);

        rule.setTopicId(dto.getTopicId());
        rule.setSourceType(dto.getSourceType());
        rule.setSpecificUserId(dto.getSpecificUserId());
        rule.setPercentage(clampPercent(dto.getPercentage()));
        return ruleRepo.save(rule);
    }

    public void deleteRule(Integer ruleId) {
        PresetRule rule = ruleRepo.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        FeedPreset preset = presetRepo.findById(rule.getPresetId())
                .orElseThrow(() -> new RuntimeException("Preset not found"));

        if (!preset.getUserId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("Not authorized to delete this rule");
        }

        ruleRepo.delete(rule);
    }

    // ---------------- Feed generation ----------------

    private List<Post> filterPostsForRule(PresetRule rule) {
        List<Post> filteredPosts;

        if (rule.getTopicId() != null) {
            List<PostTopic> postTopics = postTopicRepository.findByTopicId(rule.getTopicId());
            List<Integer> postIds = postTopics.stream().map(PostTopic::getPostId).toList();
            filteredPosts = postRepository.findAllById(postIds);
        } else {
            filteredPosts = postRepository.findAll();
        }

        if ("user".equalsIgnoreCase(rule.getSourceType())) {
            filteredPosts = filteredPosts.stream()
                    .filter(p -> p instanceof UserPost)
                    .collect(Collectors.toList());
        } else if ("bot".equalsIgnoreCase(rule.getSourceType())) {
            filteredPosts = filteredPosts.stream()
                    .filter(p -> p instanceof BotPost)
                    .collect(Collectors.toList());
        }

        if (rule.getSpecificUserId() != null) {
            filteredPosts = filteredPosts.stream()
                    .filter(p -> (p instanceof UserPost)
                            && ((UserPost) p).getUser() != null
                            && ((UserPost) p).getUser().getId().equals(rule.getSpecificUserId()))
                    .collect(Collectors.toList());
        }

        return filteredPosts;
    }

    private static final Comparator<Post> CREATED_DESC = (a, b) -> {
        Instant ca = a.getCreatedAt();
        Instant cb = b.getCreatedAt();
        if (ca == null && cb == null) return 0;
        if (ca == null) return 1;
        if (cb == null) return -1;
        return cb.compareTo(ca);
    };

    public List<Post> generateFeedForPreset(Integer presetId) {
        List<PresetRule> rules = ruleRepo.findByPresetId(presetId);
        Set<Post> resultFeed = new HashSet<>();

        for (PresetRule rule : rules) {
            List<Post> filteredPosts = filterPostsForRule(rule);

            Integer rp = rule.getPercentage();
            int limit;
            if (rp == null) {
                limit = filteredPosts.size();
            } else {
                int pct = clampPercent(rp);
                limit = (pct > 0) ? (filteredPosts.size() * pct) / 100 : 0;
            }

            resultFeed.addAll(filteredPosts.stream().limit(limit).toList());
        }

        List<Post> out = new ArrayList<>(resultFeed);
        out.sort(CREATED_DESC);
        return out;
    }

    public Page<Post> generateFeedForPreset(Integer presetId, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);
        int offset = safePage * safeSize;
        int targetCount = offset + safeSize;

        List<PresetRule> rules = ruleRepo.findByPresetId(presetId);
        Map<Integer, List<Post>> ruleToCandidates = new LinkedHashMap<>();
        Map<Integer, Integer> ruleToPercent = new LinkedHashMap<>();

        for (PresetRule r : rules) {
            List<Post> cand = filterPostsForRule(r);
            cand.sort(CREATED_DESC);
            ruleToCandidates.put(r.getId(), cand);
            ruleToPercent.put(r.getId(), clampPercent(r.getPercentage()));
        }

        LinkedHashMap<Integer, Post> unionById = new LinkedHashMap<>();
        for (List<Post> list : ruleToCandidates.values()) {
            for (Post p : list) {
                if (p != null && p.getId() != null && !unionById.containsKey(p.getId())) {
                    unionById.put(p.getId(), p);
                }
            }
        }
        List<Post> globalRuleUnion = new ArrayList<>(unionById.values());
        globalRuleUnion.sort(CREATED_DESC);

        Set<Integer> ruleIds = unionById.keySet();
        List<Post> allPosts = postRepository.findAll();
        List<Post> complement = new ArrayList<>();
        for (Post p : allPosts) {
            if (p != null && p.getId() != null && !ruleIds.contains(p.getId())) {
                complement.add(p);
            }
        }
        complement.sort(CREATED_DESC);

        int totalUnique = globalRuleUnion.size() + complement.size();

        Map<Integer, Integer> quotas = new LinkedHashMap<>();
        for (PresetRule r : rules) {
            int pct = ruleToPercent.getOrDefault(r.getId(), 0);
            int q = (pct > 0) ? (targetCount * pct) / 100 : 0;
            quotas.put(r.getId(), Math.max(0, q));
        }

        LinkedHashSet<Integer> seenIds = new LinkedHashSet<>();
        List<Post> pool = new ArrayList<>();

        for (PresetRule r : rules) {
            int quota = quotas.getOrDefault(r.getId(), 0);
            if (quota <= 0) continue;

            List<Post> cand = ruleToCandidates.getOrDefault(r.getId(), List.of());
            int taken = 0;
            for (Post p : cand) {
                if (p == null || p.getId() == null) continue;
                if (seenIds.add(p.getId())) {
                    pool.add(p);
                    taken++;
                    if (taken >= quota || pool.size() >= targetCount) break;
                }
            }
            if (pool.size() >= targetCount) break;
        }

        if (pool.size() < targetCount && !complement.isEmpty()) {
            List<Post> randomPool = complement.stream()
                    .filter(p -> p != null && p.getId() != null && !seenIds.contains(p.getId()))
                    .collect(Collectors.toCollection(ArrayList::new));
            Collections.shuffle(randomPool, ThreadLocalRandom.current());

            for (Post p : randomPool) {
                pool.add(p);
                seenIds.add(p.getId());
                if (pool.size() >= targetCount) break;
            }
        }

        List<Post> pageSlice;
        if (offset >= pool.size()) {
            pageSlice = List.of();
        } else {
            int to = Math.min(offset + safeSize, pool.size());
            pageSlice = pool.subList(offset, to);
        }

        return new PageImpl<>(pageSlice, PageRequest.of(safePage, safeSize), totalUnique);
    }
}
