package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.PostTopicDTO;
import com.syntexsquad.futurefeed.dto.TopicDTO;
import com.syntexsquad.futurefeed.model.PostTopic;
import com.syntexsquad.futurefeed.model.Topic;
import com.syntexsquad.futurefeed.repository.PostTopicRepository;
import com.syntexsquad.futurefeed.repository.TopicRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final PostTopicRepository postTopicRepository;

    public TopicService(TopicRepository topicRepository, PostTopicRepository postTopicRepository) {
        this.topicRepository = topicRepository;
        this.postTopicRepository = postTopicRepository;
    }

    public Topic createTopic(TopicDTO dto) {
        Topic topic = new Topic();
        topic.setName(dto.getName());
        return topicRepository.save(topic);
    }

    public List<Topic> getAllTopics() {
        return topicRepository.findAll();
    }

    public void assignTopicsToPost(PostTopicDTO dto) {
        postTopicRepository.deleteByPostId(dto.getPostId());
        for (Integer topicId : dto.getTopicIds()) {
            PostTopic pt = new PostTopic();
            pt.setPostId(dto.getPostId());
            pt.setTopicId(topicId);
            postTopicRepository.save(pt);
        }
    }

    public List<Integer> getTopicIdsByPostId(Integer postId) {
        List<PostTopic> mappings = postTopicRepository.findByPostId(postId);
        List<Integer> topicIds = new ArrayList<>();
        for (PostTopic pt : mappings) {
            topicIds.add(pt.getTopicId());
        }
        return topicIds;
    }

    public List<Integer> getPostIdsByTopicId(Integer topicId) {
        List<PostTopic> mappings = postTopicRepository.findByTopicId(topicId);
        List<Integer> postIds = new ArrayList<>();
        for (PostTopic pt : mappings) {
            postIds.add(pt.getPostId());
        }
        return postIds;
    }
}