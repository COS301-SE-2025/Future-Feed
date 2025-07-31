package com.syntexsquad.futurefeed.scheduler;

import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.service.BotExecutionService;
import com.syntexsquad.futurefeed.service.BotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BotScheduler {

    @Autowired
    private BotService botService;

    @Autowired
    private BotExecutionService botExecutionService;

    @Scheduled(fixedRate = 60000)
    public void runScheduledBots() {
        List<Bot> bots = botService.getAllBots();

        for (Bot bot : bots) {
            if (shouldRun(bot.getSchedule())) {
                try {
                    String result = botExecutionService.executeBot(bot.getId());
                    System.out.println("Bot post created for bot: " + bot.getName() + " | Output: " + result);
                } catch (Exception e) {
                    System.err.println("Bot failed: " + bot.getName() + " - " + e.getMessage());
                }
            }
        }
    }

    private boolean shouldRun(String schedule) {
        return "hourly".equalsIgnoreCase(schedule);
    }
}