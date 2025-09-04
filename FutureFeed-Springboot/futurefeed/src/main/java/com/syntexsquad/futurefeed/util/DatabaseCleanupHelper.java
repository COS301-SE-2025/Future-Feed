package com.syntexsquad.futurefeed.util;

import com.syntexsquad.futurefeed.repository.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabaseCleanupHelper {

    private final PostTopicRepository postTopicRepo;
    private final LikeRepository likeRepo;
    private final CommentRepository commentRepo;
    private final ReshareRepository reshareRepo;
    private final FollowerRepository followerRepo;
    private final PresetRuleRepository presetRuleRepo;
    private final FeedPresetRepository feedPresetRepo;
    private final PostRepository postRepo;
    private final AppUserRepository userRepo;

    public DatabaseCleanupHelper(PostTopicRepository postTopicRepo,
                                 LikeRepository likeRepo,
                                 CommentRepository commentRepo,
                                 ReshareRepository reshareRepo,
                                 FollowerRepository followerRepo,
                                 PresetRuleRepository presetRuleRepo,
                                 FeedPresetRepository feedPresetRepo,
                                 PostRepository postRepo,
                                 AppUserRepository userRepo) {
        this.postTopicRepo = postTopicRepo;
        this.likeRepo = likeRepo;
        this.commentRepo = commentRepo;
        this.reshareRepo = reshareRepo;
        this.followerRepo = followerRepo;
        this.presetRuleRepo = presetRuleRepo;
        this.feedPresetRepo = feedPresetRepo;
        this.postRepo = postRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public void deleteAll() {
        postTopicRepo.deleteAll();
        likeRepo.deleteAll();
        commentRepo.deleteAll();
        reshareRepo.deleteAll();
        followerRepo.deleteAll();
        presetRuleRepo.deleteAll();
        feedPresetRepo.deleteAll();
        postRepo.deleteAll();
        userRepo.deleteAll();
    }
}
