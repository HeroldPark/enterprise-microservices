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