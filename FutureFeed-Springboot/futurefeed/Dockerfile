# Use a Java runtime image
FROM eclipse-temurin:22-jdk-alpine

# Set working directory
WORKDIR /app

# Copy the built jar file into the container
COPY release/futurefeed-0.0.1-SNAPSHOT.jar futurefeed.jar

# Expose the port your Spring Boot app runs on (default 8080)
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "futurefeed.jar"]
