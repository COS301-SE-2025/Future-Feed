
# Architectural Requirements

> A project for Demo 2  
> 27 June 2025  
> by Syntex Squad  

## Summary  
Below is a summary of our architectural requirements:  

| Quality Requirement  | Architectural Tactic          | Architectural Patterns               |
|----------------------|-------------------------------|--------------------------------------|
| Scalability          | Horizontal Scaling, Data Sharding | Microservices and Database Sharding  |
| Performance          | Increase resource efficiency, maintain copies of data | Event-Driven and Caching             |
| Availability         | Replication                   | PostgreSQL streaming replication     |
| Usability           | Support system initiative, Real-time UI responsiveness | MVC                                  |
| Security            | Security detection and resistance | OAuth2 and Spring security features  |

## Architectural Design Strategy  
Our design strategy focuses on two key approaches: **Decomposition Strategy** and **Quality-Driven Requirements Strategy**.  

### Decomposition Strategy  
**Concept:** This approach involves breaking down the system into smaller, independent components or subsystems, much like constructing a building by dividing it into tasks like laying the foundation, building the walls, and installing the roof. Each component addresses specific aspects of the system, ensuring a modular and manageable architecture.  

**Benefits:**  
- **Modularity:** Each component operates independently, enhancing system understanding and management.  
- **Maintainability:** Changes or fixes can be applied to individual components without affecting the entire system.  
- **Extensibility:** Adding new features becomes easier as new components can be integrated without disrupting existing ones.  

### Quality-Driven Requirements Strategy  
**Concept:** The design process is guided by the key quality requirements of the system. These requirements define the essential characteristics that ensure the system's success, such as reliability, efficiency, security, and usability.  

**Benefits:**  
- **Focus on Quality:** By prioritizing quality from the beginning, the final system is more likely to meet or exceed user expectations.  
- **Improved User Experience:** The system will be reliable, perform well, be secure, and easy to use.  

## Architectural Quality Requirements  

### 1. Scalability  
- The system design shall allow for adding new features with minimal impact on existing functionality.  
**Quantification:**  
1. The architecture shall support horizontal scaling to manage increased user load.  
2. Data sharding will be used in database design.  

### 2. Performance  
- Performance is considered a crucial underlying factor for our system, highlighting the importance of processing power and all-round data analysis capabilities.  
**Quantification:**  
1. Feed generation and bot post creation should be within 500ms for 95% of requests (for at least 1000 concurrent users).  
2. App loading time should be less than 10 seconds.  
3. API response time should be less than 5 seconds.  
4. The average response time for user actions should not exceed 3 seconds under normal load.  

### 3. Availability  
- Our system is designed to have the ability to mask or repair faults such that the cumulative service outage period does not exceed an arbitrary value over a specified time interval.  
**Quantification:**  
1. The system shall have an uptime of 98% per month.  
2. Backup procedures must be in place to restore service within 1 hour in case of failure.  

### 4. Usability  
- A system designed to help users express themselves on a social media platform in the form of posts, AI-generated posts, following other users, and feed interaction.  
**Quantification:**  
1. Provide a clean, intuitive interface with user-friendly navigation.  
2. Ensure consistency in the design by using established design systems and component libraries.  
3. Simplify data entry and interaction processes to minimize user effort.  
4. Provide clear, concise instructions and tooltips to guide users through complex tasks.  

### 5. Security  
- The system design shall allow for adding new features with minimal impact on existing functionality.  
**Quantification:**  
1. The architecture shall support horizontal scaling to manage increased user load.  
2. Data sharding will be used in database design.  

### 6. Testability  
- Our system's testability measures our test coverage and the ability to place a clear distinction between failing and passing units in our code.  
**Quantification:**  
1. Presentation Layer: Usability Tests with our user base.  
2. Logic Layer: SpringBoot testing framework for unit tests.  
3. Data Layer: SpringBoot testing framework for database operations.  
4. Between layers: Postman to test interactions.  
5. System-wide: SpringBoot testing framework for end-to-end tests.  
6. At least 60% coverage overall.  

## Architectural Strategies  
This project aims to develop a user-friendly and reliable social media platform where users can share posts, content, and engage with posts generated by Bots as well as posts that are trending in general.  

### Scalability  
1. **Horizontal Scaling:** Adding more resources to logical units, such as servers or classes.  
2. **Data Sharding:** Splitting large datasets into smaller chunks stored on separate database servers.  

### Performance  
1. **Increase Resource Efficiency:** Improving algorithms to decrease latency.  
2. **Maintain Multiple Copies of Data (Caching):** Keeping copies of data on storage with different access speeds.  

### Availability  
1. **PostgreSQL Streaming Replication/Replication:** Components are exact clones of each other to protect against hardware failures.  

### Usability  
1. **User-Centric Design:** Focus on intuitive and user-friendly interfaces.  
2. **Accessibility:** Ensure the application is accessible to a wide range of users.  
3. **Responsive Design:** Optimal usability across different screen sizes.  

### Security  
1. **Security Detection:** Verify message integrity using checksums and hash values.  
2. **Security Resistance:** Identify, authenticate, and authorize actors; encrypt data.  

### Testability  
1. **Automated Testing Framework:** Rigorous testing across different layers.  
2. **Unit Tests:** Validate individual components.  
3. **Integration Tests:** Verify interactions between units.  
4. **End-to-End Tests:** Ensure smooth system flow.  
5. **Coverage Reports:** Ensure critical paths are tested.  

## Architectural Patterns  
For a social media platform like Future Feed, a hybrid architecture combining several patterns would be the best approach.  

### 1. MVC (Model-View-Controller)  
- Separates application functionality into:  
  - **Model:** Contains the application's data.  
  - **View:** Displays data and interacts with the user.  
  - **Controller:** Mediates between the model and the view.  

### 2. Event-Driven  
- Real-time features such as posts, notifications, likes, and reshares are powered by an event-driven architecture.  
**Benefits:**  
  - **Real-Time Processing:** Critical for a platform like Future Feed.  
  - **Decoupling:** Event producers and consumers are decoupled for flexibility and scaling.  

### 3. Database Sharding  
- Partition massive databases into smaller, manageable pieces.  
**Benefits:**  
  - **Improved Scalability:** Horizontally scale databases by adding more servers.  
  - **Better Performance:** Reduces load on individual servers.  

### 4. Microservices  
- Break down the platform into small, independently scalable services (e.g., user service, feed generation service).  
**Benefits:**  
  - Each team can optimize resource usage per service.  

## Constraints  

### Budget Constraints  
- Limited financial resources for initial development, deployment, and maintenance.  
- Preference for open-source tools and free-tier services.  

### Hardware Constraints  
- Compatibility with common farming hardware, including sensors and IoT devices.  
- Limited processing power and memory on older smartphones and tablets.  

### Software Constraints  
- AWS free-tier limits performance to 1000 users.  
- Bot content quality tied to LLM, requires internet access.  
- LLM cost.  

### Network Constraints  
- Ensuring functionality in areas with limited or intermittent internet connectivity.  
- Efficient data transfer protocols to minimize bandwidth usage.  

## Technology Choices  

### Frontend  
1. **Vite**  
   - **Pros:**  
     - Ease of Use: Gentle learning curve, extensive documentation.  
     - Performance: High performance and efficient rendering.  
     - Efficient: Works well with modern libraries like React and supports TypeScript.  

2. **React**  
   - **Pros:**  
     - Ecosystem & Community: Massive ecosystem of tools and libraries.  
     - Component-Driven Architecture: Scalable, reusable UI pieces.  
     - TypeScript Integration: Strong typing for better maintainability.  
   - **Cons:**  
     - Learning Curve: Additional concepts and configurations.  
     - Opinionated Structure: May not suit every use case.  

3. **TailwindCSS**  
   - **Pros:**  
     - Consistency: Ensures a consistent design system.  
     - Utility-First Approach: Speeds up styling with predefined classes.  
   - **Cons:**  
     - Verbose HTML: Utility classes can lead to more verbose markup.  

### Testing  
1. **SpringBoot Built-in Testing Framework**  
   - **Benefits:**  
     - Rapid Setup: Auto-configures the environment.  
     - Built-in Testing Tools: Supports JUnit, Mockito, and integration testing.  
     - Easy Data Setup: Supports data injection for test cases.  

### Backend  
1. **PostgreSQL**  
   - **Pros:**  
     - Advanced Features: Supports complex queries, foreign keys, triggers, etc.  
     - Extensibility: Allows custom data types and operators.  
     - Performance Optimization: Powerful indexing and partitioning.  
     - Community and Support: Large, active community.  
   - **Cons:**  
     - Complexity: Steep learning curve.  
     - Resource Intensive: Requires more system resources.  

2. **Java**  
   - **Benefits:**  
     - Robust Ecosystem: Libraries for messaging, security, database access, etc.  
     - Concurrency Handling: Well-suited for real-time features.  
