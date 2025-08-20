# Future Feed Coding Standards Document
## Introduction
This document outlines the coding standards and conventions for developing Future Feed, ensuring code uniformity, clarity, flexibility, reliability, and efficiency. The system consists of a frontend (built using React (tsx), ShadCN/UI and TailwindCSS) and a backend (built with Java's Springboot, PostgreSQL, and Javascript).
These standards apply to all team members and are designed to facilitate collaboration, maintenance, and scalability, drawing from principles in Chapter 18 of the textbook. The file structure is organized to reflect the system's architecture, and all code must adhere to the specified conventions for naming, formatting, commenting, and testing.

## Coding Standards
### File Header
Each source file will have a standardized file header to provide file location, versioning, author, project, and update history. The header will be written in third-person, simple present tense.
- Currently not implemented

### Naming Conventions
Naming conventions ensure clarity and consistency.
- Packages are named using lowercase (with hyphens)
- Files are named using camelCase and/or PascalCase
- Classes are named using PascalCase
- Functions/Methods are named using PascalCase
- Variables are named using camelCase
- Constants are named using UPPER_SNAKE_CASE
- Interfaces are named using PascalCase
Spaces, special characters and control characters are avoided.

### Formatting Conventions
Formatting enhances readability and consistency across the codebase.
- **Indentation**: 2 spaces for indentation
- **Line Length**: Maximum 100 characters per line
- **Braces**: Place opening braces on the same line as the statement
- **Spacing**: Include a single space after keywords, no space inside parantheses. If statements can either be on one line or stretch across multiple lines.
- **Semicolons**: Use semicolons at the end of statements in languages that support them
- **Blank Lines**: USe one blank line between methods and logical code blocks.

### In-Code Comment Conventions
Comments facilitate understanding and maintenance
- Use comments to describe the purpose of the class, function and methods above the declaration
- Use comments to explain complex lines and fields

### Branching Conventions
- Used GitFlow
- Code merged with `dev` branch before `main`
- A pull request must be approved by at least two members
- Branches should be created from issues and issues should be closed after feature completion

### Test-Driven Development (TDD)
- Java Melody was used for monitoring our backend during testing and development. With it wwe could monitor response times, sql query executions and overall performance of the backend and any changes in performance when there is modifications made.
- Branch coverage is the testing of the different branches or paths in a program such as in conditional statements. We have made efforts in our testing to test possible paths in our code such as success and failure tests
- Tests were written using JUnit 5 with SpringbootTest and MockMvc. We did unit tests that were mocked to test different functions in isolation as well as integration tests simulate and test the system as it would be used in real world environment
- As we would implement new features such as Topics, Bookmarks and Reshare we would also perform tests with every new implementation in order to catch any potential bugs and issues with the implementation and thus correcting them.
- Through out development and testing we have ensured to refactor our code and even our test code to improve the internal structure our system and improve performance and readability. With java melody we could also monitor how our refactored code may impact response times and memory.

### Code Review Checklist
1. The program correctly implements the functionality and conforms to the design specification
2. The implemented class interfaces conform to the interfaces specified in the design class diagram
3. The implementation complies to the coding standards

### Responsibilities
- Developers: Write code that adheres to standards and requirements
- Reviewers: Verify compliance to pipeline and conflict avoidance/resolving

### File Structure
```
FUTURE-FEED/
├── .github/
├── AI-Bot/
├── db/
├── Documentation/
|  ├── Diagrams/
|  ├── Logos/
|  ├── Screenshots/
|  ├── Specification/
|  |  ├── Architectural Specifications/
|  |  ├── Coding Standards/
|  |  ├── Design Specifications/
|  |  ├── Manuals/
|  |  └── Requirement Specifications/
|  └── Wireframes/
├── frontend/
|  ├── dist/
|  ├── node_modules/
|  ├── public/
|  ├── src/
|  |  ├── assets/
|  |  ├── components/
|  |  ├── hooks/
|  |  ├── lib/
|  |  ├── pages/
|  |  ├── providers/
|  |  ├── store/
|  |  ├── utils/
├── frontendV0/
|  ├── dist/
|  ├── node_modules/
|  ├── public/
|  ├── src/
|  |  ├── assets/
|  |  ├── components/
|  |  ├── hooks/
|  |  ├── lib/
|  |  ├── pages/
|  |  ├── providers/
|  |  ├── store/
|  |  └── utils/
├── Future-Feed/
├── FutureFeed-Springboot/
|  ├── futurefeed/
|  |  ├── .mvn/
|  |  ├── src/
|  |  ├── target/
|  ├── target/
|  |  ├── classes/
├── node_modules/
├── .env
├── .eslintignore
├── .gitIgnore
├── docker-compose.yml
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
└── tailwind.config.js
```
### Directory Descriptions
- `FutureFeed-Springboot` contains controllers, models, routes, and utilities
- `frontend` Organizes React components, pages, hooks, routes, and styles for the user interface
- `AI-Bot` used for the AI-Bot moderator
- `Documentation` contains all the documentation for this project

### Tool Support
- **IDE**: Visual Studio Code and IntelliJ for editing and debugging
- **Docker**
- **Linter:** ESLint
- **Formatter**: Prettier for consistent formatting
- **Testing**: Java Melody
- **Version Control**: Git for source code management
