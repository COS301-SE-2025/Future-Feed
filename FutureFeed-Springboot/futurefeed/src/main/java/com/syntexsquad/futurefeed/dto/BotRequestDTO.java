package com.syntexsquad.futurefeed.dto;

public class BotRequestDTO {
    private String name;
    private String prompt;
    private String schedule;
    private String contextSource;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public String getContextSource() {
        return contextSource;
    }

    public void setContextSource(String contextSource) {
        this.contextSource = contextSource;
    }
}
