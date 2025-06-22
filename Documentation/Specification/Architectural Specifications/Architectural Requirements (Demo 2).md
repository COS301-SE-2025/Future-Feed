<div align="center">

# Architectural Requirements:
## 1. Architectural Design Strategy:


## 2. Architectural Strategy:


## 3. Architectural Quality Requirements:
**Performance**(time taken to switch between pages and retrieve feed) <br>
**Security**(Using OAuth and/or JWT) <br>
**Usability**(How easy it is to use the system in terms of post and user management and maybe responsiveness) <br>
**Reliability**(ensured through the pass rate from our unit tests) <br>
**Maintainability**(test coverage, clear documentation and CI/CD pipelines)

## 4. Architectural Design and Pattern:
### Architectural Design:

### Architectural Patterns:
**Microservices**: Separate user management, feed generation, bot management, AI integration. <br>
**Layered**: Presentation, business logic, data access layers.

## 5. Architectural Constraints:
**LLM Cost**: Cache API responses, limit calls for free-tier/low-cost LLM. <br>
**Scalability**: AWS free-tier limits performance at 1000 users. <br>
**Bot Behavior**: Make sure bots don't generate harmful content. The flagged posts should be reviewed manually. <br>
**Data Privacy**: No unauthorized data access.<br>
**AI Limitations**: Bot content quality tied to LLM, requires internet access.

## 6. Technology Choices:

</div>

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
