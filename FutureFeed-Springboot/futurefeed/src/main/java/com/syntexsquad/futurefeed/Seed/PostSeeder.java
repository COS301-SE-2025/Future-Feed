package com.syntexsquad.futurefeed.Seed;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
public class PostSeeder implements CommandLineRunner {

    private final PostRepository postRepo;
    private final AppUserRepository userRepo;
    private final TopicRepository topicRepo;

    public PostSeeder(PostRepository postRepo, AppUserRepository userRepo, TopicRepository topicRepo) {
        this.postRepo = postRepo;
        this.userRepo = userRepo;
        this.topicRepo = topicRepo;
    }

    @Override
    public void run(String... args) {
        if (postRepo.count() > 0) return; // skip if already seeded

        AppUser user = userRepo.findById(1L).orElseThrow();
        List<Topic> topics = topicRepo.findAll();

        if (topics.isEmpty()) {
            System.out.println("No topics found. Add topics first.");
            return;
        }

        Random rand = new Random();

        for (int i = 1; i <= 50; i++) {
            UserPost post = new UserPost();
            post.setContent("Post #" + i + " - Test content for feed preset.");
            post.setImageUrl("https://picsum.photos/200?random=" + i);
            post.setUser(user);
            post.setTopic(topics.get(rand.nextInt(topics.size())));
            post.setCreatedAt(LocalDateTime.now().minusMinutes(rand.nextInt(1000)));

            postRepo.save(post);
        }

        System.out.println("✅ 50 test posts seeded.");
    }
}
