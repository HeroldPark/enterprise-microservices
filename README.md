# 로컬에서 수정 사항을 기록한다.

# 2025-12-18

git init
git add README.md
git commit -m "first commit"
git branch -M master
git remote add origin git@github.com:HeroldPark/enterprise-microservices.git
git push -u origin master

# 2025-12-26
  - gradle 버젼으로 변환
  - docker desktop 에서 build, run 완료

# 2025-12-27
    - eureka-server 연동 완료

# 2025-12-28
  - user-service 디버깅을 할 수 없다.

# 2025-12-29
  - user-service 디버깅 성공 : Readme-local.md 참조
  - board-service 기능 추가
  - front-end 디렉토리 구조 변경

  < 디버깅 오류 >
  - 메시지 : ConfigError: The project 'board-service' is not a valid java project.
  - 원인 : board-service의 package path가 잘못 되어 있었다.(launch.json)
  - gradle project 왼쪽 메뉴에서 JAVA PROJETCTS 아래 *.jar 파일을 인식하지 못해서 발생하는 오류

  < 대책 >
  - Ctrl + Shift + P
  - "Java: Clean Java Language Server Workspace" 입력 및 실행
  - Cursor 완전 종료 후 재시작 (중요!)
  - ./gradlew clean build --refresh-dependencies
  - ./gradlew build --continuous

# 2025-12-31

✅ 해결된 문제들 요약

1️⃣ Zustand Persist 문제

문제: localStorage의 auth-storage와 token 불일치
해결: api.js에서 auth-storage에서도 token 읽도록 수정

2️⃣ PrivateRoute 인증 체크

문제: Zustand hydration 타이밍 이슈
해결: hydration 완료 대기 로직 추가

3️⃣ API Gateway 인증

문제: /api/orders/** 경로가 인증 필요로 설정됨
해결: permitAll()로 변경

4️⃣ Authorization 헤더 전송

문제: localStorage에서 token 못 읽음
해결: auth-storage fallback 추가

# 스케일 아웃을 위한 리팩토링

📦 제공된 파일들
1️⃣ GatewayConfig.java (리팩토링)

하드코딩된 경로를 Properties로 변경
각 서비스별 설정을 routeProperties에서 읽음

2️⃣ GatewayRouteProperties.java (신규)

라우팅 설정을 관리하는 Properties 클래스
User, Product, Order, Board 서비스별 설정

3️⃣ SecurityConfig.java (리팩토링)

보안 경로를 Properties로 변경
Public/Authenticated 경로를 securityPaths에서 읽음

4️⃣ SecurityPathProperties.java (신규)

보안 경로 설정을 관리하는 Properties 클래스
Public Paths, Authenticated Paths 분리

5️⃣ application-gateway.yml (설정)

모든 라우팅 및 보안 설정
Dev/Prod 프로파일별 설정 예시 포함


# 2026-01-01
  - board 인증 처리 구현
  - board 테이블 형식으로 변경
  - 권한에 따른 메뉴 필터링
  - Models 메뉴 추가
  - Admin Panel 추가 > 사용자 관리 추가 > 사용자 목록 불러오기 진행 중
  - api-gateway 기능 보완

# 2026-01-02
  - 관리 기능 > 모델 설정, 시스템 설정 추가
  - 메뉴 수정 : Demo 추가, 모델 설정 관리 수정

# 2026-01-03
  - Admin menu 편집 기능 추가 : 진행중

# 2026-01-06
  - 기능별 코드 정리

# 2026-01-07
  - 서버 사이드 코드 정리 : /admin/menus, /admin/settings, /admin/model-configs
  - frontend : 메뉴 관리 등록 > 사이드 메뉴 아래 랜더링 되게 함.
  - frontend AdminPanel의 모든 통계 API 호출

# 2026-01-08
  - 서비스 간 request/response 처리
  - admin-service - user-service, board-service

# 2026-01-09
  - message-service 추가(mariadb-message, message-service)

# 2026-01-09
  - code-assistent, gradle project 미인식 
  => enterprise-microservices/settings.gradle.kts에 등록해야 함.
  - message-service, api-gateway에 kafka message queue 추가
  - kafka 테스트 중

# 2026-01-12
  - kafka 오류 수정 - applicatiom.yml과 소스 코드 사이의 mapping 수정

# 2026-01-14
  - product-service, order-service 주석 처리
  - demo 메뉴 주석 처리
  - model-service 추가

# 2026-01-15
  - message-service : Query 로그 결과 출력되게 수정
  - docker-compose.yml, application.yml, application-dev.yml, logback-spring.xml, log4jdbc.log4j2.properties
  - local, dev, prod 분리 설정
  - kafka : 받은 쪽지함, 보낸 쪽지함, 전체 메시지, 자동 생성기