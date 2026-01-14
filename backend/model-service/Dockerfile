# Stage 1: Build
FROM gradle:8.11-jdk21-alpine AS build
WORKDIR /app
COPY settings.gradle.kts ./
COPY build.gradle ./
COPY src ./src
RUN gradle clean build -x test --no-daemon

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 모델 및 데이터셋 디렉토리 생성
RUN mkdir -p /app/models /app/datasets

EXPOSE 8087

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
