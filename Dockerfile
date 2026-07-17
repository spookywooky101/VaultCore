# ── Stage 1: Build the Spring Boot JAR ──────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and download dependencies first (Docker cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn package -DskipTests

# ── Stage 2: Run the JAR ─────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from Stage 1
COPY --from=build /app/target/cms-0.0.1-SNAPSHOT.jar app.jar

# Create uploads directory (for profile pictures fallback)
RUN mkdir -p uploads

# Expose port 8080
EXPOSE 8080

# Start with production profile
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
