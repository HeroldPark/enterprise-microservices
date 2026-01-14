# Model Service

AI 모델 학습 및 예측을 위한 마이크로서비스

## 주요 기능

- AI 모델 생성 및 관리
- 모델 학습 및 학습 이력 추적
- 예측 실행 및 결과 저장
- 다양한 모델 타입 지원:
  - Isolation Forest (이상 탐지)
  - LSTM (시계열 예측)
  - GRU (시계열 예측)
  - Random Forest (분류)
  - XGBoost (분류/회귀)

## 기술 스택

- **Backend**: Spring Boot 3.4.10
- **Database**: PostgreSQL 16
- **ORM**: JPA/Hibernate
- **Security**: JWT Authentication
- **Service Discovery**: Eureka Client
- **Message Queue**: Kafka

## PostgreSQL 선택 이유

1. **JSON 지원**: 모델 설정 및 메타데이터를 JSON으로 저장 가능
2. **고급 인덱싱**: 대용량 학습 데이터 처리에 유리
3. **ACID 준수**: 트랜잭션 안정성 보장
4. **확장성**: 수평적/수직적 확장 용이
5. **통계 함수**: 학습 결과 분석에 유용한 내장 함수 제공

## API 엔드포인트

### Model Management
- `POST /models` - 모델 생성
- `GET /models` - 모델 목록 조회
- `GET /models/{id}` - 모델 상세 조회
- `PUT /models/{id}` - 모델 수정
- `DELETE /models/{id}` - 모델 삭제
- `GET /models/stats` - 모델 통계

### Training
- `POST /training` - 모델 학습 시작
- `GET /training/history/{modelId}` - 학습 이력 조회

### Prediction
- `POST /predictions` - 예측 실행
- `GET /predictions/model/{modelId}` - 모델별 예측 조회
- `GET /predictions/user/{username}` - 사용자별 예측 조회

## 빌드 및 실행

### 로컬 실행
```bash
./gradlew bootRun
```

### Docker 빌드
```bash
docker build -t model-service:latest .
```

### Docker Compose로 실행
```bash
docker-compose up -d postgres-model
docker-compose up -d model-service
```

## 환경 변수

```yaml
SPRING_DATASOURCE_URL: jdbc:postgresql://postgres-model:5432/model-db
SPRING_DATASOURCE_USERNAME: rozeta
SPRING_DATASOURCE_PASSWORD: rozeta123
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka/
KAFKA_BOOTSTRAP_SERVERS: kafka:9092
```

## 데이터베이스 스키마

### models
- id: BIGSERIAL PRIMARY KEY
- name: VARCHAR(100)
- type: VARCHAR(50) (ModelType enum)
- description: VARCHAR(500)
- created_by: VARCHAR(50)
- status: VARCHAR(20) (ModelStatus enum)
- model_path: VARCHAR(500)
- dataset_path: VARCHAR(500)
- config: TEXT (JSON)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### training_histories
- id: BIGSERIAL PRIMARY KEY
- model_id: BIGINT (FK)
- epoch: INTEGER
- training_loss: DOUBLE PRECISION
- validation_loss: DOUBLE PRECISION
- training_accuracy: DOUBLE PRECISION
- validation_accuracy: DOUBLE PRECISION
- metrics: TEXT (JSON)
- created_at: TIMESTAMP

### predictions
- id: BIGSERIAL PRIMARY KEY
- model_id: BIGINT (FK)
- input_data: TEXT
- output_data: TEXT
- confidence: DOUBLE PRECISION
- predicted_by: VARCHAR(50)
- metadata: TEXT (JSON)
- created_at: TIMESTAMP

## 프론트엔드 통합

### 라우트 추가 (App.jsx)
```javascript
// Model Routes
<Route path="/models" element={<Models />} />
<Route path="/models/create" element={<ModelCreate />} />
<Route path="/models/:id" element={<ModelDetail />} />
<Route path="/models/edit/:id" element={<ModelEdit />} />
<Route path="/predictions/create" element={<PredictionCreate />} />
```

### 필수 패키지
```bash
npm install chart.js react-chartjs-2
```

## 개발 참고사항

1. 학습 프로세스는 현재 시뮬레이션으로 구현됨
2. 실제 ML 라이브러리 통합 시 Python 서비스 연동 필요
3. 대용량 모델 파일은 별도 스토리지 사용 권장
4. 학습 진행 상태는 WebSocket으로 실시간 업데이트 가능

## 포트

- Service: 8087
- Database: 15432 (PostgreSQL)
