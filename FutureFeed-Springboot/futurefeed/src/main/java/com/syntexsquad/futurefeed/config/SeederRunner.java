package com.syntexsquad.futurefeed.config;

import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

@Component
public class SeederRunner implements CommandLineRunner {

    private final AppUserRepository userRepo;
    private final PostRepository postRepo;
    private final TopicRepository topicRepo;
    private final PostTopicRepository postTopicRepo;

    public SeederRunner(
            AppUserRepository userRepo,
            PostRepository postRepo,
            TopicRepository topicRepo,
            PostTopicRepository postTopicRepo
    ) {
        this.userRepo = userRepo;
        this.postRepo = postRepo;
        this.topicRepo = topicRepo;
        this.postTopicRepo = postTopicRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        boolean ENABLE_SEEDING = true; // <-- toggle this on/off manually

        if (!ENABLE_SEEDING) return;

        if (userRepo.count() >= 40) {
            System.out.println(" Skipping user seed (users already present)");
        } else {
            List<AppUser> users = new ArrayList<>();
            for (int i = 1; i <= 40; i++) {
                AppUser user = new AppUser();
                user.setUsername("user" + i);
                user.setEmail("user" + i + "@example.com");
                user.setPassword("hashed_password_" + i);
                user.setDisplayName("User " + i);
                user.setBio("Bio for user " + i);
                user.setDateOfBirth(LocalDate.of(1990 + i, 1, 1));
                users.add(user);
            }
            userRepo.saveAll(users);
            System.out.println("Seeded 40 users");
        }

        if (topicRepo.count() == 0) {
            List<Topic> topics = List.of("Tech", "Health", "Sports", "Gaming", "Politics", "Music","News", "Memes").stream().map(name -> {
                Topic t = new Topic();
                t.setName(name);
                return t;
            }).toList();
            topicRepo.saveAll(topics);
            System.out.println("Seeded topics");
        }

        // Create 300 posts
        if (postRepo.count() >= 300) {
            System.out.println("Skipping post seed (300+ posts already present)");
        } else {
            List<AppUser> allUsers = userRepo.findAll();
            List<Topic> allTopics = topicRepo.findAll();
            Random random = new Random();

            List<UserPost> posts = new ArrayList<>();
            for (int i = 1; i <= 300; i++) {
                UserPost post = new UserPost();
                post.setContent("Post content " + i);
                post.setUser(allUsers.get(random.nextInt(allUsers.size())));
                posts.add(post);
            }
            postRepo.saveAll(posts);
            System.out.println("Seeded 300 user posts");
        

            // Assign each post to 1–2 random topics
            List<PostTopic> postTopics = new ArrayList<>();
            for (Post post : posts) {
                Set<Topic> assigned = new HashSet<>();
                while (assigned.size() < 1 + random.nextInt(2)) {
                    assigned.add(allTopics.get(random.nextInt(allTopics.size())));
                }
                for (Topic topic : assigned) {
                    PostTopic pt = new PostTopic();
                    pt.setPostId(post.getId());
                    pt.setTopicId(topic.getId());
                    postTopics.add(pt);
                }
            }
            postTopicRepo.saveAll(postTopics);
            System.out.println("Assigned topics to posts");

            System.out.println("Finished seeding demo data!");
        }
    }
}
