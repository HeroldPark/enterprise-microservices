# Local Development with MariaDB

이 docker-compose 파일은 로컬 개발 환경에서 PostgreSQL 대신 MariaDB를 사용하도록 구성되었습니다.

## 주요 변경사항

### 1. 데이터베이스 변경
- **PostgreSQL 15 Alpine** → **MariaDB 10.11**
- 3개의 독립적인 MariaDB 인스턴스 (user, product, order)

### 2. 포트 매핑
- mariadb-user: `13306:3306`
- mariadb-product: `13307:3306`
- mariadb-order: `13308:3306`

### 3. 데이터베이스 접속 정보
```
Database: user-db / product-db / order-db
Username: rozeta
Password: rozeta123
Root Password: maria123
```

### 4. JDBC URL 형식
```
spring.datasource.url=jdbc:mariadb://localhost:3306/user-db?useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=rozeta
spring.datasource.password=rozeta123
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

spring.datasource.url=jdbc:mariadb://localhost:3307/product-db?useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=rozeta
spring.datasource.password=rozeta123
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

spring.datasource.url=jdbc:mariadb://localhost:3308/order-db?useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=rozeta
spring.datasource.password=rozeta123
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
```

```
CREATE DATABASE IF NOT EXISTS user-db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS product-db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS order-db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'rozeta'@'localhost' IDENTIFIED BY 'rozeta123';

GRANT ALL PRIVILEGES ON user-db.*    TO 'rozeta'@'localhost';
GRANT ALL PRIVILEGES ON product-db.* TO 'rozeta'@'localhost';
GRANT ALL PRIVILEGES ON order-db.*   TO 'rozeta'@'localhost';

FLUSH PRIVILEGES;
```

### 5. 문자 인코딩
- UTF-8 완전 지원을 위해 `utf8mb4` 문자셋 사용
- Collation: `utf8mb4_unicode_ci`

## 필수 작업

### 1. Spring Boot 서비스의 pom.xml 수정
각 서비스(user-service, product-service, order-service)의 `pom.xml`에 MariaDB 드라이버를 추가하세요:

```xml
<dependency>
    <groupId>org.mariadb.jdbc</groupId>
    <artifactId>mariadb-java-client</artifactId>
    <scope>runtime</scope>
</dependency>
```

기존 PostgreSQL 의존성은 제거하거나 주석 처리:
```xml
<!-- <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency> -->
```

### 2. application.yml 또는 application-local.properties 수정

**application-local.properties 예시:**
```properties
# MariaDB DataSource Configuration
spring.datasource.url=jdbc:mariadb://localhost:3306/user-db?useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=rozeta
spring.datasource.password=rozeta123
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

spring.datasource.url=jdbc:mariadb://localhost:3307/product-db?useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=rozeta
spring.datasource.password=rozeta123
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

spring.datasource.url=jdbc:mariadb://localhost:3308/order-db?useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=rozeta
spring.datasource.password=rozeta123
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MariaDBDialect
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

**또는 application.yml 예시:**
```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/user-db?useUnicode=true&characterEncoding=UTF-8
    username: rozeta
    password: rozeta123
    driver-class-name: org.mariadb.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MariaDBDialect
        format_sql: true
    show-sql: true
```

### 3. SQL 문법 차이 확인
PostgreSQL과 MariaDB는 일부 SQL 문법이 다릅니다:
- `SERIAL` → `AUTO_INCREMENT`
- `BIGSERIAL` → `BIGINT AUTO_INCREMENT`
- `BOOLEAN` → `TINYINT(1)` 또는 `BOOLEAN`
- `TEXT` → `TEXT` (동일하지만 동작 방식 약간 다름)
- `NOW()` → `NOW()` (동일)

## 실행 방법

### 1. BuildKit을 사용한 빌드 및 실행
```bash
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose -f docker-compose-local.yml up -d --build
```

### 2. 일반 실행
```bash
docker-compose -f docker-compose-local.yml up -d
```

### 3. 로그 확인
```bash
docker-compose -f docker-compose-local.yml logs -f
```

### 4. 특정 서비스 로그 확인
```bash
docker-compose -f docker-compose-local.yml logs -f mariadb-user
docker-compose -f docker-compose-local.yml logs -f user-service
```

### 5. 중지 및 삭제
```bash
docker-compose -f docker-compose-local.yml down
```

### 6. 볼륨까지 완전 삭제
```bash
docker-compose -f docker-compose-local.yml down -v
```

## MariaDB 접속 방법

### Docker 컨테이너 내부에서 접속
```bash
# User DB
docker exec -it mariadb-user mariadb -u rozeta -prozeta123 userdb

# Product DB
docker exec -it mariadb-product mariadb -u rozeta -prozeta123 productdb

# Order DB
docker exec -it mariadb-order mariadb -u rozeta -prozeta123 orderdb
```

### 호스트에서 직접 접속 (MySQL Client 필요)
```bash
# User DB
mysql -h 127.0.0.1 -P 13306 -u rozeta -p user-db

# Product DB
mysql -h 127.0.0.1 -P 13307 -u rozeta -p product-db

# Order DB
mysql -h 127.0.0.1 -P 13308 -u rozeta -p order-db
```

## 문제 해결

### 1. 컨테이너가 시작되지 않는 경우
```bash
docker-compose -f docker-compose-local.yml logs mariadb-user
```

### 2. 데이터베이스 연결 실패
- 포트가 이미 사용 중인지 확인: `netstat -an | grep 3306`
- 방화벽 설정 확인
- MariaDB 컨테이너의 healthcheck 상태 확인

### 3. 문자 인코딩 문제
MariaDB 컨테이너 내에서 확인:
```sql
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';
```

### 4. 초기 데이터베이스 재생성
```bash
docker-compose -f docker-compose-local.yml down -v
docker-compose -f docker-compose-local.yml up -d
```

## 성능 최적화 팁

1. **로컬 개발시 볼륨 사용**: 데이터 영속성 보장
2. **불필요한 로그 끄기**: `spring.jpa.show-sql=false`
3. **Connection Pool 설정**:
```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
```

## 참고사항

- MariaDB 10.11은 LTS(Long Term Support) 버전입니다
- UTF-8 완전 지원을 위해 `utf8mb4` 사용을 권장합니다
- 프로덕션 환경에서는 보안을 위해 비밀번호를 환경 변수로 관리하세요

# 필수 서비스들은 백그라운드에서 실행되고, user-service의 로그는 터미널에서 실시간으로 확인

# 인프라 서비스들은 백그라운드로
# 모든 서비스 실행
docker-compose up -d mariadb-user mariadb-product mariadb-order config-server eureka-server product-service order-service frontend

모두 Docker로 실행 (권장)
# 로컬 User Service 중지 (Ctrl+C)
# Docker Compose 재시작
# --build 플래그는 컨테이너를 시작하기 전에 이미지를 다시 빌드하라는 의미
docker-compose down
docker-compose up -d --build

# api-gateway user-service만 포그라운드로 (로그 확인하면서)
docker-compose up api-gateway user-service

# 로그 확인
docker-compose logs -f product-service

# 모든 서비스 중지
docker-compose stop

# 단계별 실행

# 1단계: 데이터베이스
docker-compose up -d mariadb-user

# 2단계: Config Server
docker-compose up -d config-server

# 3단계: Eureka Server
docker-compose up -d eureka-server

# 4단계: User Service (로그 보면서)
docker-compose up -d user-service

# 5단계: API Gateway
docker-compose up -d api-gateway

# 6단계: Frontend
docker-compose up -d frontend

# user-service 로그 확인
docker-compose logs -f user-service

# Maven Wrapper 생성
mvn -N io.takari:maven:wrapper

