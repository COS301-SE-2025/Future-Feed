package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.PostTopicDTO;
import com.syntexsquad.futurefeed.dto.TopicDTO;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.PostTopic;
import com.syntexsquad.futurefeed.model.Topic;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.repository.PostTopicRepository;
import com.syntexsquad.futurefeed.repository.TopicRepository;
import com.syntexsquad.futurefeed.util.TopicSmartTaggerClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TopicService {

    private static final Logger log = LoggerFactory.getLogger(TopicService.class);

    private final TopicRepository topicRepository;
    private final PostTopicRepository postTopicRepository;
    private final PostRepository postRepository;

    public TopicService(TopicRepository topicRepository,
                        PostTopicRepository postTopicRepository,
                        PostRepository postRepository) {
        this.topicRepository = topicRepository;
        this.postTopicRepository = postTopicRepository;
        this.postRepository = postRepository;
    }

    @CachePut(value = "topics", key = "#result.id")
    public Topic createTopic(TopicDTO dto) {
        Topic topic = new Topic();
        topic.setName(dto.getName() == null ? null : dto.getName().trim());
        Topic saved = topicRepository.save(topic);
        log.info("[topics] created id={} name='{}'", saved.getId(), saved.getName());
        return saved;
    }

    @Cacheable(value = "topics")
    public List<Topic> getAllTopics() {
        List<Topic> all = topicRepository.findAll();
        log.info("[topics] getAll -> {}", all.stream().map(Topic::getName).toList());
        return all;
    }

    @CacheEvict(value = "postTopics", key = "#dto.postId")
    @Transactional
    public void assignTopicsToPost(PostTopicDTO dto) {
        log.info("[assign] postId={} replace with topicIds={}", dto.getPostId(), dto.getTopicIds());
        postTopicRepository.deleteByPostId(dto.getPostId());
        for (Integer topicId : dto.getTopicIds()) {
            PostTopic pt = new PostTopic();
            pt.setPostId(dto.getPostId());
            pt.setTopicId(topicId);
            postTopicRepository.save(pt);
        }
    }

    @Cacheable(value = "postTopics", key = "#postId")
    public List<Integer> getTopicIdsByPostId(Integer postId) {
        List<PostTopic> mappings = postTopicRepository.findByPostId(postId);
        List<Integer> topicIds = new ArrayList<>();
        for (PostTopic pt : mappings) {
            topicIds.add(pt.getTopicId());
        }
        log.info("[lookup] postId={} -> topicIds={}", postId, topicIds);
        return topicIds;
    }

    @Cacheable(value = "topicPosts", key = "#topicId")
    public List<Integer> getPostIdsByTopicId(Integer topicId) {
        List<PostTopic> mappings = postTopicRepository.findByTopicId(topicId);
        List<Integer> postIds = new ArrayList<>();
        for (PostTopic pt : mappings) {
            postIds.add(pt.getPostId());
        }
        log.info("[lookup] topicId={} -> postIds={}", topicId, postIds);
        return postIds;
    }


    @Transactional
    @CacheEvict(value = {"topics", "postTopics"}, allEntries = true)
    public void autoTagIfMissing(Integer postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!postTopicRepository.findByPostId(postId).isEmpty()) {
            log.info("[autoTag] postId={} already has tags. Skipping.", postId);
            return;
        }

        String content = post.getContent();
        if (content == null || content.isBlank()) {
            log.info("[autoTag] postId={} has no content. Skipping.", postId);
            return;
        }
        List<Topic> allTopics = topicRepository.findAll();
        List<String> existingNames = allTopics.stream()
                .map(Topic::getName)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        log.info("[autoTag] postId={} content.len={} existingTopics.size={}",
                postId, content.length(), existingNames.size());

        Map<String, List<String>> result = TopicSmartTaggerClient.tag(content, existingNames, 3);
        List<String> selected = result.getOrDefault("selected", List.of());
        List<String> newOnes  = result.getOrDefault("new", List.of());

        log.info("[autoTag] postId={} tagger selected={} new={}", postId, selected, newOnes);

        Set<Integer> topicIds = new LinkedHashSet<>();

        for (String raw : selected) {
            String key = norm(raw);
            topicRepository.findByNameIgnoreCase(key)
                    .or(() -> topicRepository.findByName(key))
                    .ifPresentOrElse(
                            t -> {
                                topicIds.add(t.getId());
                                log.info("[autoTag] matched existing '{}' -> id={}", raw, t.getId());
                            },
                            () -> log.warn("[autoTag] selected '{}' not found in DB", raw)
                    );
        }

        for (String raw : newOnes) {
            String pretty = raw == null ? "" : raw.trim();
            if (pretty.isBlank()) continue;

            Topic t = topicRepository.findByNameIgnoreCase(pretty)
                    .or(() -> topicRepository.findByName(pretty))
                    .orElseGet(() -> {
                        Topic nt = new Topic();
                        nt.setName(pretty);
                        Topic saved = topicRepository.save(nt);
                        log.info("[autoTag] created new topic id={} name='{}'", saved.getId(), saved.getName());
                        return saved;
                    });

            topicIds.add(t.getId());
        }

        if (topicIds.isEmpty()) {
            log.warn("[autoTag] postId={} no topics resolved; nothing to save.", postId);
            return;
        }

        postTopicRepository.deleteByPostId(postId);
        for (Integer topicId : topicIds) {
            PostTopic pt = new PostTopic();
            pt.setPost(post);
            pt.setTopicId(topicId);
            PostTopic saved = postTopicRepository.save(pt);
            log.info("[autoTag] mapping saved id={} postId={} topicId={}", saved.getId(), postId, topicId);
        }
    }

    private String norm(String s) {
        return s == null ? "" : s.trim();
    }

    public List<Topic> getTrendingTopics(int limit, int hoursBack) {
        LocalDateTime since = LocalDateTime.now().minusHours(hoursBack);
        return topicRepository.findTrendingTopics(since, PageRequest.of(0, limit));
    }

    public List<Post> getPostsForTopic(Integer topicId) {
        return topicRepository.findPostsByTopicId(topicId);
    }
}
