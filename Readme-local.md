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
mysql -h 127.0.0.1 -P 3306 -u rozeta -p userdb

# Product DB
mysql -h 127.0.0.1 -P 3307 -u rozeta -p productdb

# Order DB
mysql -h 127.0.0.1 -P 3308 -u rozeta -p orderdb
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

# 2025-12-26
  - gradle 버젼으로 변환
  - docker desktop 에서 build, run 완료