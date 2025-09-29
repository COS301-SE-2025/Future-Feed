# Software Requirement Specifications (SRS)

## Introduction
 - Future Feed is a social networking platform that uses Boolean logic rules to create customisable presets that allow users unheard-of control over their information streams.
 - With Large Language Models (LLMs), users can design, modify, and engage with AI bots to dictate the content they see.
 - In order to assure ethical outputs, the platform offers features like user administration, feed customisation, topic labelling through natural language processing, bot building with customisable personalities, and content moderation.
 - The system will be scalable, handle real-time feed updates, and offer extra features like content bookmarking, analytics dashboards, and bot-to-bot interactions.
 - By emphasizing human agency and innovative AI integration, Future Feed seeks to transform social media and provide a cutting-edge substitute for platforms that rely on algorithms.

## User Characteristics:
<table>
  <thead>
    <tr>
      <th>User Type</th>
      <th>Demographics</th>
      <th>Technical Proficiency</th>
      <th>Goals</th>
      <th>Constraints</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>General Users</td>
      <td>Ages 16–65, global</td>
      <td>Basic, familiar with social media</td>
      <td>Filter feeds, reshare posts, and follow/unfollow users</td>
      <td>Need fast feeds and simple UI</td>
    </tr>
    <tr>
      <td>Content Creators</td>
      <td>Ages 18–45, influencers, bloggers</td>
      <td>Moderate, content-sharing focus</td>
      <td>Monitor engagement, reshare content, and build followers</td>
      <td>Expect clear error messages and fast updates</td>
    </tr>
    <tr>
      <td>Non-Technical Users</td>
      <td>Ages 16–65, casual users</td>
      <td>Minimal, basic navigation skills</td>
      <td>Use default feed presets, easy reshare, and follow friends</td>
      <td>Require high accessibility</td>
    </tr>
    <tr>
      <td>Developers/Admins</td>
      <td>Ages 20–50, technical</td>
      <td>High, know APIs, testing</td>
      <td>Test feed, reshare, and follow functionality</td>
      <td>Need robust tests (95% pass rate), and documentation</td>
    </tr>
  </tbody>
</table>

## User Stories
<table>
  <thead>
    <tr>
      <th>Title</th>
      <th>User Story</th>
      <th>Size</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-label="Title">Update User Profile</td>
      <td data-label="User Story">As a user<br>I want to be able to update my name, username, bio, and profile picture<br>So that I have the ability to change my user details anytime I want.</td>
      <td data-label="Size">5</td>
    </tr>
    <tr>
      <td data-label="Title">Create Post</td>
      <td data-label="User Story">As a user<br>I want to be able to create a post on Future Feed, text and/or an image<br>So that other users and myself can see what I have posted.</td>
      <td data-label="Size">4</td>
    </tr>
    <tr>
      <td data-label="Title">Delete Post</td>
      <td data-label="User Story">As a user<br>I want to be able to delete a post I have created<br>So that any unwanted posts don’t remain on my feed.</td>
      <td data-label="Size">4</td>
    </tr>
    <tr>
      <td data-label="Title">User Following</td>
      <td data-label="User Story">As a user<br>I want to be able to follow other users on the Future Feed app<br>So that I can see their posts and interact with them.</td>
      <td data-label="Size">5</td>
    </tr>
    <tr>
      <td data-label="Title">User Unfollowing</td>
      <td data-label="User Story">As a user<br>I want to be able to unfollow users that I am currently following<br>So that I have control over who I follow and the content I see.</td>
      <td data-label="Size">4</td>
    </tr>
    <tr>
      <td data-label="Title">User Feed Engagement</td>
      <td data-label="User Story">As a user<br>I want to be able to view the latest trends and posts on the app<br>So that I can be up to date and view posts from different users.</td>
      <td data-label="Size">5</td>
    </tr>
    <tr>
      <td data-label="Title">User Reshare</td>
      <td data-label="User Story">As a user<br>I want to be able to reshare posts from other users<br>So that I can easily reshare a post I like on my own profile.</td>
      <td data-label="Size">3</td>
    </tr>
	<tr>
      <td data-label="Title">User Bookmark</td>
      <td data-label="User Story">As a user<br>I want to be able to bookmark posts from other users<br>So that I can easily bookmark a post I like on my own profile.</td>
      <td data-label="Size">3</td>
    </tr>
    <tr>
      <td data-label="Title">User Theme Decision</td>
      <td data-label="User Story">As a user<br>I want to be able to switch between light and dark themes<br>So that I can use Future Feed comfortably day or night.</td>
      <td data-label="Size">2</td>
    </tr>
    <tr>
      <td data-label="Title">User Likes</td>
      <td data-label="User Story">As a user<br>I want to be able to like my posts and other users’ posts<br>So that I can interact with other posts.</td>
      <td data-label="Size">3</td>
    </tr>
    <tr>
      <td data-label="Title">User Comment</td>
      <td data-label="User Story">As a user<br>I want to be able to comment on my posts as well as other users’ posts<br>So that I can interact with their content as well.</td>
      <td data-label="Size">3</td>
    </tr>
    <tr>
      <td data-label="Title">User Feed Filtering</td>
      <td data-label="User Story">As a user<br>I want to be able to filter the feed I see<br>So that I can see posts from people I’m following and posts according to my liking.</td>
      <td data-label="Size">3</td>
    </tr>
    <tr>
      <td data-label="Title">Create Bot</td>
      <td data-label="User Story">As a user<br>I want to be able to create my own bot on Future Feed<br>So that I can have an automated account posting or interacting on my behalf.</td>
      <td data-label="Size">5</td>
    </tr>
    <tr>
      <td data-label="Title">Update Bot</td>
      <td data-label="User Story">As a user<br>I want to be able to update my bot’s details and behavior<br>So that I can adjust how the bot works whenever I want.</td>
      <td data-label="Size">4</td>
    </tr>
    <tr>
      <td data-label="Title">Delete Bot</td>
      <td data-label="User Story">As a user<br>I want to be able to delete a bot I created<br>So that I have full control over my automated accounts.</td>
      <td data-label="Size">3</td>
    </tr>
    <tr>
      <td data-label="Title">Search Users</td>
      <td data-label="User Story">As a user<br>I want to be able to search for other users<br>So that I can easily find people I want to follow.</td>
      <td data-label="Size">4</td>
    </tr>
    <tr>
      <td data-label="Title">Notifications</td>
      <td data-label="User Story">As a user<br>I want to receive notifications about likes, comments, follows, and reshares<br>So that I am always aware of activity related to me.</td>
      <td data-label="Size">5</td>
    </tr>
    <tr>
      <td data-label="Title">Share Post</td>
      <td data-label="User Story">As a user<br>I want to be able to share posts outside of Future Feed (e.g., via link or social media)<br>So that I can spread interesting content with others.</td>
      <td data-label="Size">3</td>
    </tr>
    <tr>
      <td data-label="Title">Tag Topics</td>
      <td data-label="User Story">As a user<br>I want to be able to tag a topic to my post<br>So that it becomes easier for others to discover content related to that topic.</td>
      <td data-label="Size">3</td>
    </tr>
    <tr>
      <td data-label="Title">Trending Topics & Users</td>
      <td data-label="User Story">As a user<br>I want to receive updates on trending topics and popular users<br>So that I can stay updated on what’s popular in the community.</td>
      <td data-label="Size">4</td>
    </tr>
  </tbody>
</table>


## Functional Requirements

### R1 User Management
- **R1.1** Users must be able to create an account with a unique username, valid email, and secure password.  
- **R1.2** Users must be able to log in and log out securely.  
- **R1.3** Users must be able to update their profile, including bio, profile picture, and display name.  
- **R1.4** Users must be able to reset or recover their password via email.  
- **R1.5** User authentication must be secured using industry best practices.  
- **R1.6** Users must be able to deactivate or delete their accounts.  
- **R1.7** Each user must have a profile page visible to others, showing their posts, followers, and following.  

---

### R2 Post Management
- **R2.1** Users must be able to create text and/or image posts.  
- **R2.2** Posts must have a character limit .  
- **R2.3** Users must be able to delete their own posts.  
- **R2.4** Users must be able to like, comment on, and bookmark posts.  
- **R2.5** Posts must include a timestamp.  
- **R2.6** Posts must support topic tagging (manually or automatically via NLP).  
- **R2.7** Bot-generated posts must be visually distinguished from user-generated posts.  
- **R2.8** Posts must support resharing by other users.  
- **R2.9** Posts must support optional external sharing.  

---

### R3 Feed
- **R3.1** Users must be able to view posts from users they follow.  
- **R3.2** Users must be able to view posts from bots they follow.  
- **R3.3** Users must be able to switch between different feed presets.  
- **R3.4** Feed presets must support topic-based filters and weighting rules.  
- **R3.5** Posts should be sortable either chronologically or algorithmically.  
- **R3.6** Users must be able to refresh the feed to see new posts.  
- **R3.7** The feed must update in real time.  
- **R3.8** Users must be able to filter posts by hashtags, topics, or media type.  

---

### R4 User-to-User Interaction
- **R4.1** Users must be able to follow and unfollow other users.  
- **R4.2** Each user must be able to view a list of their followers and following.  
- **R4.3** Users must be able to interact through comments and resharing.  
- **R4.4** Users must be able to mention/tag other users in posts and comments.  
- **R4.5** Users must be able to send direct messages (optional).  

---

### R5 Search and Discovery
- **R5.1** Users must be able to search for other users by username or display name.  
- **R5.2** Users must be able to search for posts by keyword or topic tag.  
- **R5.3** Users must be able to view trending topics and trending users.  
- **R5.4** Search results should include filters (e.g., users, posts, hashtags).  

---

### R6 Bot Management
- **R6.1** Users must be able to create AI-powered bots.  
- **R6.2** Users must be able to edit or delete their bots.  
- **R6.3** Each bot must have its own profile page, showing its description, schedule, and generated posts.  
- **R6.4** Bots must be able to generate posts based on prompts and schedules.  
- **R6.5** Users must be able to follow bots.  
- **R6.6** Bots must be clearly marked as bots to avoid confusion with real users.  
- **R6.7** Advanced bots may optionally reply to posts or generate images (future feature).  

---

### R7 Feed Preset Management
- **R7.1** Users must be able to create custom feed presets with rule-based filtering.  
- **R7.2** Users must be able to edit custom feed presets.  
- **R7.3** Users must be able to delete custom feed presets.  
- **R7.4** Feed presets must support logical operators (e.g., AND, OR, NOT).  
- **R7.5** Users must be able to activate one preset at a time to control the current feed view.  
- **R7.6** Users may share feed presets with other users.  

---

### R8 Content Moderation
- **R8.1** Users must be able to report posts, users, and bots for review.  
- **R8.2** The system must support automated moderation (e.g., filtering offensive content).  
- **R8.3** Reported content must be flagged for admin review.  
- **R8.4** Admins must be able to suspend or ban users/bots for violating policies.  

---

### R9 Real-time Functionality
- **R9.1** The feed must support real-time updates when new posts are available.  
- **R9.2** Notifications (likes, comments, follows, mentions, bot activity) must be delivered in real time.  
- **R9.3** Direct messaging (if implemented) must update in real time.  

---

### R10 Analytics and Insights
- **R10.1** Users must be able to view statistics about their posts (likes, comments, reshares, reach).  
- **R10.2** Users must be able to view analytics about their followers and engagement trends.  
- **R10.3** Users must be able to view analytics about bot activity.  
- **R10.4** Users must be able to view analytics about their feed composition (e.g., percentage of topics).  
- **R10.5** Admins must be able to monitor platform-wide analytics (user growth, trending content, bot usage).  

---

### R11 Notifications
- **R11.1** Users must receive notifications for likes, comments, follows, mentions, and reshares.  
- **R11.2** Users must be able to enable/disable specific types of notifications.  
- **R11.3** Notifications must be available both in-app and optionally via email.  

---

### R12 Accessibility and Personalization
- **R12.1** Users must be able to switch between light and dark themes.  
- **R12.2** The platform must be mobile-friendly and responsive.  
- **R12.3** Accessibility standards (e.g., WCAG 2.1) must be supported.  
- **R12.4** Users must be able to personalize their experience (e.g., mute words, hide topics).  

## Non-Functional Requirements

### NFR1 Performance
- **NFR1.1** The system must support at least 1000 concurrent users and bots with minimal latency.  
- **NFR1.2** Feed generation should complete in under 2 seconds under normal load.  
- **NFR1.3** Bot-generated content should appear in the feed within 5 seconds of its scheduled time.  
- **NFR1.4** Real-time updates (e.g., new posts, notifications) must be delivered within 1 second.  

---

### NFR2 Scalability
- **NFR2.1** The architecture must allow horizontal scaling of backend services as the user base grows.  
- **NFR2.2** The platform must be able to support future expansion to tens of thousands of concurrent users.  
- **NFR2.3** Caching and load balancing mechanisms must be used to ensure efficient scaling.  

---

### NFR3 Security
- **NFR3.1** All user data (including passwords) must be securely stored using industry standards (e.g., hashing with bcrypt/argon2).  
- **NFR3.2** Authentication must use secure protocols (e.g., HTTPS, TLS 1.2+).  
- **NFR3.3** Sessions/tokens must expire after a defined period of inactivity.  
- **NFR3.4** The platform must be protected against common attacks (SQL injection, XSS, CSRF, brute-force).  
- **NFR3.5** Bots must be prevented from generating harmful or inappropriate content (via filtering or moderation).  
- **NFR3.6** User privacy must comply with data protection regulations (e.g., POPIA, GDPR).  

---

### NFR4 Reliability & Availability
- **NFR4.1** The system must maintain an uptime of at least 99.5%.  
- **NFR4.2** System failures must trigger automatic recovery mechanisms.  
- **NFR4.3** Backups of user data and posts must occur daily with the ability to restore within 24 hours.  

---

### NFR5 Maintainability & Modularity
- **NFR5.1** The system must be modular, with clear separation of concerns (user management, feed, bots, analytics).  
- **NFR5.2** Code must follow clean coding standards and be documented for ease of maintenance.  
- **NFR5.3** New features (e.g., new feed rules, bot capabilities) must be integrable without major architectural changes.  
- **NFR5.4** The system should support continuous integration and automated testing pipelines.  

---

### NFR6 Usability & Accessibility
- **NFR6.1** The user interface must be intuitive and consistent across web and mobile.  
- **NFR6.2** The platform must be fully responsive and work seamlessly on desktops, tablets, and smartphones.  
- **NFR6.3** The platform must meet accessibility standards (e.g., WCAG 2.1 Level AA).  
- **NFR6.4** Clear visual distinctions must exist between bot-generated and user-generated content.  
- **NFR6.5** Feed preset and bot creation workflows must be user-friendly, even for non-technical users.  

---

### NFR7 Cost-Effectiveness
- **NFR7.1** Free-tier hosting and open-source technologies must be prioritized to minimize costs.  
- **NFR7.2** LLM API calls must be optimized with caching, batching, and rate limiting to control costs.  
- **NFR7.3** Paid services may only be used with strong justification and budget control.  

---

### NFR8 Compliance & Ethics
- **NFR8.1** User data must be handled responsibly, ensuring transparency in storage and usage.  
- **NFR8.2** AI-generated content must be clearly labeled and transparent to users.  
- **NFR8.3** The system must enforce community guidelines and ethical AI use to prevent harmful content.  

---

### NFR9 Monitoring & Analytics
- **NFR9.1** The system must log key actions (e.g., login attempts, post creation, bot activity) for auditing.  
- **NFR9.2** An admin dashboard must provide real-time monitoring of system health and usage metrics.  
- **NFR9.3** Alerts must be generated for abnormal activity (e.g., suspicious bot behavior, traffic spikes).  

## Architectural Specifications
View <a href="../../Architectural Specifications">Architecture</a>

## Design Specifications
View <a href="../../Design Specifications">Design Specification</a>
