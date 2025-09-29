# Software Requirement Specifications (SRS)

## Content
* [Introduction](#Introduction)
* [User Stories](#User-Stories)
* [Functional Requirements](#functional-requirements)
* [Service Contracts](#Service-Contracts)
* [Use Case](#use-case)
* [Domain Model](#Domain-Model)
* [Architectural Requirements](#Architectural-Requirements)
* [Technology Requirements](#Technology-Requirements)

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
                <td data-label="User Story">As a user<br>I want to be able to unfollow users that i am currently following <br>So that I have control over who follows me on the app and control over the content i see from users i follow. </td>
                <td data-label="Size">4</td>
            </tr>
            <tr>
                <td data-label="Title">User Feed Engagement</td>
                <td data-label="User Story">As a user<br>I want to be able to view the latest trends and posts on the app <br>So that I can be up to date and view posts from different users.</td>
                <td data-label="Size">5</td>
            </tr>
            <tr>
                <td data-label="Title">User Reshare</td>
                <td data-label="User Story">As a user<br>I want to be able to reshare posts from other users<br>So that I can easily reshare a post I like on my own profile.</td>
                <td data-label="Size">3</td>
            </tr>
            <tr>
                <td data-label="Title">User Theme Decisiontd>
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
                <td data-label="User Story">As a user<br>I want to be able to filter the feed I seebr>So that I can see posts from people I’m following and posts according to my liking.</td>
                <td data-label="Size">3</td>
            </tr>
        </tbody>
    </table>

## Functional Requirements
R1 User Management
 - R1.1 Users must be able to create an account with a unique username and valid email.

 - R1.2 Users must be able to log in and log out securely.

 - R1.3 Users must be able to update their profile, including bio, profile picture, and display name.

 - R1.4 Users must be able to reset or recover their password via email.

 - R1.5 User authenticarion must be secured using industry best practices.

R2 Post Management
 - R2.1 Users must be able to post texts and/or images.

 - R2.2 Posts must have a character limit (e.g., 280 characters).

 - R2.3 Users must be able to delete their posts.

 - R2.4 Posts can be liked and commented on.

 - R2.5 Posts must have a timestamp.

 - R2.6 Posts must have a topic category tag (or automatic using NLP).

 - R2.7 Posts generated by bots must be easily spotted. 

R3 Feed
 - R3.1 Users must be able to view posts from other users they follow on the feed.

 - R3.2 Users must be able to view posts from bots they follow on the feed.

 - R3.3 Users must be able to switch between different feed presets.

 - R3.4 Feed presets should have topic based filters.

 - R3.5 Posts should be sorted either chronologically or algorithmically.

 - R3.6 Users must be able to refresh the feed to get new posts.

R4 User to user interaction
 - R4.1 Users must be able to follow and unfollow other users.

 - R4.2 Each user must be able to view a list of followers and following.

 - R4.3 Users must be able to interact with each other through comments (and maybe post resharing).

R5 Search and discovery
 - R5.1 Users must be able to search for other users by username or display name

 - R5.2 Users must be able to search for posts by keyword or topic tag.

R6 Bot Management
 - R6.1 Users must able to create AI bots.

 - R6.2 Users must be able to edit or delete bots.

 - R6.3 Each bot should have a profile page.

 - R6.4 Bots must be able to generate posts.

 - R6.5 Users must be able to follow bots.

R7 Feed Preset Management
 - R7.1 Users must be able to create custom feed presets.

 - R7.2 Users must be able to edit custom feed presets.

 - R7.3 Users must be able to delete custom feed presets.

 - R7.4 Feed presets should allow rule-based filtering.

 - R7.5 Users must be able to activate one preset at a time to control the current feed view.

 - R7.6 Users may optionally share their feed presets with other users.

R8 Content Moderation
 - R8.1 Users must be able to report posts, users and bots for review.

R9 Real-time functionality
 - R9.1 The feed must support real-time updates when new posts are available (e.g., using WebSockets).

R10 Analytics and Insights
 - R10.1 Users must be able to view statistics about their own posts and interactions.

 - R10.2 Users must be able to view analytics about bot activity.

 - R10.3 Users must be able to view analytics about their feed composition.

## Service Contracts
<a href="https://github.com/COS301-SE-2025/Future-Feed/blob/main/Documentation/Specification/Requirement%20Specifications/Demo%201/Service%20Contract%20(Demo%201).md">
	Service Contracts Link
</a>

## Architectural Requirements
<a href="https://github.com/COS301-SE-2025/Future-Feed/tree/main/Documentation/Specification/Architectural%20Specifications">
  Architectural Requirements Link
</a>

## Use Case
<a href="https://github.com/COS301-SE-2025/Future-Feed/tree/main/Documentation/Diagrams/Use%20Case%20Diagram" alt="Use Case Diagram" width="500"> Use Case </a>


## Domain Model
<a href="https://github.com/COS301-SE-2025/Future-Feed/tree/main/Documentation/Diagrams/Domain%20Model"> Domain Model </a>

## 6. Technology Choices:

- **Frontend**: <br>
   Primary: React (TSX), CSS, HTML, JavaScript, TailwindCSS, ShadCN/UI.

 - **Backend**: <br>
   Primary: Java, Spring Boot.
   
 - **API**: <br>
   Primary: REST (Spring Boot).

 - **Database**: <br>
   Primary: PostgreSQL.

 - **AI Module**: <br>
   Primary: Python, Hugging Face Transformers (open-source LLM).
   Alternative: Google Gemini API (low-cost, if justified).

 - **Hosting**: <br>
   AWS Free Tier (Elastic Beanstalk, Lambda).

 - **Real-Time Updates**: <br>
   WebSockets.

 - **Version Control**: <br>
   GitHub

 - **Security**: <br>
   JWT authentication, OAuth2.0 .

 - **CI/CD**: <br>
   GitHub Actions.

 - **Team Tools**: <br>
   Project Management: GitHub Projects.

 - **IDEs**: <br>
   VS Code, IntelliJ IDEA.
