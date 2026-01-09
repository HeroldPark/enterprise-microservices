# Kafka KRaft Mode 가이드

## 🎯 KRaft 모드란?

KRaft(Kafka Raft)는 Apache Kafka 2.8.0부터 도입된 새로운 메타데이터 관리 방식입니다. 기존의 Zookeeper를 대체하여 Kafka 자체적으로 메타데이터를 관리합니다.

### 주요 특징

✅ **Zookeeper 불필요**
- 별도의 Zookeeper 클러스터 관리가 필요 없음
- 인프라 복잡도 감소
- 운영 부담 감소

✅ **향상된 성능**
- 메타데이터 처리 속도 개선
- 파티션 수 제한 완화 (수백만 개까지 가능)
- 더 빠른 컨트롤러 failover

✅ **단순화된 아키텍처**
- 하나의 시스템으로 통합
- 설정 및 배포 간소화
- 모니터링 포인트 감소

## 🔧 본 프로젝트의 KRaft 설정

### Docker Compose 설정

```yaml
kafka:
  image: confluentinc/cp-kafka:7.5.0
  environment:
    # KRaft 설정
    KAFKA_NODE_ID: 1
    KAFKA_PROCESS_ROLES: broker,controller
    KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9094
    KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
    
    # Listener 설정
    KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,PLAINTEXT_HOST://0.0.0.0:9093,CONTROLLER://0.0.0.0:9094
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:9093
    
    # 클러스터 ID
    CLUSTER_ID: MkU3OEVBNTcwNTJENDM2Qk
```

### 포트 구성

| 포트 | 용도 | 접근 |
|------|------|------|
| 9092 | Broker (내부) | Docker 네트워크 내부 |
| 9093 | Broker (외부) | 호스트 머신 접근 |
| 9094 | Controller | KRaft 내부 통신 |

## 📊 Zookeeper vs KRaft 비교

### 아키텍처 비교

#### 기존 (Zookeeper 사용)
```
┌─────────────┐     ┌─────────────┐
│   Kafka     │────▶│  Zookeeper  │
│  Brokers    │     │  Ensemble   │
└─────────────┘     └─────────────┘
     │                     │
     └─────────┬───────────┘
               │
        메타데이터 관리
```

#### KRaft 모드
```
┌─────────────────────┐
│   Kafka Cluster     │
│  (Broker+Controller)│
└─────────────────────┘
          │
    자체 메타데이터 관리
```

### 기능 비교

| 항목 | Zookeeper 모드 | KRaft 모드 |
|------|----------------|------------|
| 외부 의존성 | Zookeeper 필요 | 불필요 |
| 컴포넌트 수 | Kafka + Zookeeper | Kafka만 |
| 파티션 제한 | ~20만 개 | 수백만 개 |
| Failover 시간 | 수 초 | 수백 ms |
| 설정 복잡도 | 높음 | 낮음 |
| 운영 복잡도 | 높음 | 낮음 |

## 🚀 KRaft 모드 시작하기

### 1. 스토리지 포맷

최초 실행시 자동으로 스토리지가 포맷됩니다:

```bash
kafka-storage format -t MkU3OEVBNTcwNTJENDM2Qk -c /etc/kafka/kafka.properties
```

### 2. Kafka 시작

```bash
docker-compose up -d kafka
```

### 3. 상태 확인

```bash
# Kafka 로그 확인
docker-compose logs -f kafka

# 브로커 상태 확인
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092
```

## 🔍 KRaft 모드 확인 방법

### 1. 메타데이터 확인

```bash
# 메타데이터 쿼리
docker exec kafka kafka-metadata --bootstrap-server kafka:9092 describe
```

### 2. Controller 상태 확인

```bash
# Controller 정보 조회
docker exec kafka kafka-metadata --bootstrap-server kafka:9092 describe --controllers
```

### 3. Quorum 상태 확인

```bash
# Quorum 상태 조회
docker exec kafka kafka-metadata --bootstrap-server kafka:9092 describe --quorum
```

## ⚙️ KRaft 클러스터 ID

### Cluster ID란?

- KRaft 모드에서 Kafka 클러스터를 식별하는 고유 ID
- 한 번 설정되면 변경 불가
- 본 프로젝트: `MkU3OEVBNTcwNTJENDM2Qk`

### 새로운 Cluster ID 생성

```bash
# 랜덤 Cluster ID 생성
docker exec kafka kafka-storage random-uuid
```

## 🏗️ 프로덕션 환경 구성

### 3노드 KRaft 클러스터 예시

```yaml
# docker-compose.prod.yml
services:
  kafka-1:
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka-1:9094,2@kafka-2:9094,3@kafka-3:9094
      
  kafka-2:
    environment:
      KAFKA_NODE_ID: 2
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka-1:9094,2@kafka-2:9094,3@kafka-3:9094
      
  kafka-3:
    environment:
      KAFKA_NODE_ID: 3
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka-1:9094,2@kafka-2:9094,3@kafka-3:9094
```

### 역할 분리 구성 (권장)

```yaml
# Controller 노드 (3개)
kafka-controller-1:
  environment:
    KAFKA_PROCESS_ROLES: controller

# Broker 노드 (5개)
kafka-broker-1:
  environment:
    KAFKA_PROCESS_ROLES: broker
    KAFKA_CONTROLLER_QUORUM_VOTERS: 1@controller-1:9094,2@controller-2:9094,3@controller-3:9094
```

## 🔄 Zookeeper에서 KRaft로 마이그레이션

### 마이그레이션 단계

1. **현재 클러스터 백업**
```bash
# 토픽 및 설정 백업
kafka-topics --bootstrap-server localhost:9092 --list > topics.txt
```

2. **메타데이터 스냅샷 생성**
```bash
kafka-metadata-shell --snapshot /path/to/metadata
```

3. **KRaft 클러스터 구성**
```bash
# 새로운 KRaft 클러스터 시작
docker-compose -f docker-compose.kraft.yml up -d
```

4. **데이터 복제**
```bash
# MirrorMaker를 사용한 데이터 마이그레이션
kafka-mirror-maker --consumer.config source.properties \
                    --producer.config target.properties
```

## 📈 모니터링

### KRaft 특화 메트릭

```bash
# Controller 메트릭
curl http://localhost:8080/metrics | grep kafka.controller

# Quorum 상태
curl http://localhost:8080/metrics | grep kafka.raft
```

### 주요 모니터링 포인트

- **Controller 상태**: Active Controller 수
- **Quorum Health**: Quorum 멤버 상태
- **Metadata Lag**: 메타데이터 동기화 지연
- **Leader Election**: 리더 선출 횟수

## ⚠️ 주의사항

### 1. 버전 요구사항
- Kafka 3.3.0 이상 권장 (KRaft 프로덕션 준비)
- Kafka 2.8.0 ~ 3.2.x는 Early Access

### 2. 호환성
- 기존 Kafka 클라이언트 호환
- Zookeeper 모드와의 동시 사용 불가
- 한 번 KRaft로 전환하면 되돌리기 어려움

### 3. 제약사항
- JBOD (Just a Bunch Of Disks) 미지원
- 일부 관리 도구 미지원 (점진적 개선 중)

## 🎯 KRaft 모드 선택 이유

본 프로젝트에서 KRaft 모드를 선택한 이유:

1. **단순성**: Zookeeper 없이 Kafka만으로 운영
2. **현대적**: Apache Kafka의 미래 방향성
3. **성능**: 더 빠른 메타데이터 처리
4. **학습**: 최신 Kafka 기술 습득
5. **운영**: 관리 포인트 감소

## 📚 추가 자료

- [KIP-500: Replace ZooKeeper with a Self-Managed Metadata Quorum](https://cwiki.apache.org/confluence/display/KAFKA/KIP-500%3A+Replace+ZooKeeper+with+a+Self-Managed+Metadata+Quorum)
- [Kafka Documentation - KRaft](https://kafka.apache.org/documentation/#kraft)
- [Apache Kafka Without ZooKeeper](https://developer.confluent.io/learn/kraft/)

## 🔗 관련 문서

- **QUICK_START.md** - 빠른 시작 가이드
- **DOCKER_GUIDE.md** - Docker 실행 가이드
- **README.md** - 프로젝트 전체 개요

---

**Note**: KRaft 모드는 Kafka 3.3.0부터 프로덕션 준비 완료되었습니다. 본 프로젝트는 Confluent Platform 7.5.0 (Kafka 3.5.x 기반)을 사용합니다.
