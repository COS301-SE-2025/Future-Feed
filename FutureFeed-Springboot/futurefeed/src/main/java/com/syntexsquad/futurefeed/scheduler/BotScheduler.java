package com.syntexsquad.futurefeed.scheduler;

import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.model.BotPosts;
import com.syntexsquad.futurefeed.service.BotExecutionService;
import com.syntexsquad.futurefeed.service.BotService;
import com.syntexsquad.futurefeed.repository.BotPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class BotScheduler {

    @Autowired
    private BotService botService;

    @Autowired
    private BotExecutionService botExecutionService;

    @Autowired
    private BotPostRepository botPostRepository;

    /**
     * Runs every 5 minutes and decides whether a bot should post or not.
     */
    @Scheduled(fixedRate = 300000) // every 5 minutes
    public void runScheduledBots() {
        List<Bot> bots = botService.getAllBots();

        for (Bot bot : bots) {
            try {
                if (shouldRun(bot)) {
                    String result = botExecutionService.executeBot(bot.getId());
                    System.out.println("✅ Bot post created for bot: " + bot.getName() + " | Output: " + result);
                }
            } catch (Exception e) {
                System.err.println("❌ Bot failed: " + bot.getName() + " - " + e.getMessage());
            }
        }
    }

    private boolean shouldRun(Bot bot) {
        if (bot.getSchedule() == null) {
            return false; // skip bots without a schedule
        }

        // Get last bot post
        Optional<BotPosts> lastPostOpt = botPostRepository.findTopByBotIdOrderByCreatedAtDesc(bot.getId());
        LocalDateTime now = LocalDateTime.now();

        if (lastPostOpt.isEmpty()) {
            return true; // no posts yet, run immediately
        }

        LocalDateTime lastPostTime = lastPostOpt.get().getCreatedAt();
        Duration sinceLast = Duration.between(lastPostTime, now);

        return switch (bot.getSchedule().toLowerCase()) {
            case "hourly" -> sinceLast.toHours() >= 1;
            case "daily" -> sinceLast.toDays() >= 1;
            case "weekly" -> sinceLast.toDays() >= 7;
            default -> false;
        };
    }
}
