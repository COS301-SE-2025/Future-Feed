package com.syntexsquad.futurefeed.dto;

public class PostDTO {
    private Integer id;
    private String content;
    private String imageUrl;
    private String createdAt;
    private UserPublicDTO user;

    private Boolean isBot;   
    private Integer botId;  

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public UserPublicDTO getUser() { return user; }
    public void setUser(UserPublicDTO user) { this.user = user; }

    public Boolean getIsBot() { return isBot; }
    public void setIsBot(Boolean isBot) { this.isBot = isBot; }

    public Integer getBotId() { return botId; }
    public void setBotId(Integer botId) { this.botId = botId; }
}
