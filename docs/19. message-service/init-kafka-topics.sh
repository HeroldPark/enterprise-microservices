#!/bin/bash

# Kafka Topics Initialization Script (KRaft Mode)
# Kafka가 완전히 시작될 때까지 대기하고 필요한 토픽들을 생성합니다.
# Note: KRaft 모드를 사용하므로 Zookeeper가 필요없습니다.
# Linux/Git Bash용

echo "========================================="
echo "Kafka Topics Initialization (KRaft Mode)"
echo "========================================="

# Kafka 연결 정보
KAFKA_BROKER="localhost:9093"
REPLICATION_FACTOR=1
PARTITIONS=3

# Kafka가 준비될 때까지 대기
echo "Waiting for Kafka to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker exec kafka kafka-broker-api-versions --bootstrap-server kafka:9092 > /dev/null 2>&1; then
        echo "✓ Kafka is ready!"
        break
    fi
    attempt=$((attempt + 1))
    echo "  Attempt $attempt/$max_attempts - waiting 5 seconds..."
    sleep 5
done

if [ $attempt -eq $max_attempts ]; then
    echo "✗ Failed to connect to Kafka after $max_attempts attempts"
    exit 1
fi

echo ""
echo "Creating Kafka topics..."
echo "----------------------------------------"

# 토픽 생성 함수
create_topic() {
    local topic_name=$1
    local description=$2
    
    echo "Creating topic: $topic_name"
    echo "  Description: $description"
    
    docker exec kafka kafka-topics \
        --create \
        --bootstrap-server kafka:9092 \
        --replication-factor $REPLICATION_FACTOR \
        --partitions $PARTITIONS \
        --topic $topic_name \
        --if-not-exists
    
    if [ $? -eq 0 ]; then
        echo "✓ Topic '$topic_name' created successfully"
    else
        echo "✗ Failed to create topic '$topic_name'"
    fi
    echo ""
}

# Message Service 토픽 생성
create_topic "message.created" "메시지 생성 이벤트"
create_topic "message.read" "메시지 읽음 이벤트"
create_topic "message.deleted" "메시지 삭제 이벤트"

# User Service 토픽 (확장용)
create_topic "user.registered" "사용자 등록 이벤트"
create_topic "user.updated" "사용자 정보 수정 이벤트"
create_topic "user.deleted" "사용자 삭제 이벤트"

# Order Service 토픽 (확장용)
create_topic "order.created" "주문 생성 이벤트"
create_topic "order.confirmed" "주문 확인 이벤트"
create_topic "order.cancelled" "주문 취소 이벤트"
create_topic "order.completed" "주문 완료 이벤트"

# Board Service 토픽 (확장용)
create_topic "board.post.created" "게시글 작성 이벤트"
create_topic "board.comment.created" "댓글 작성 이벤트"

echo "========================================="
echo "Listing all topics:"
echo "========================================="

docker exec kafka kafka-topics \
    --list \
    --bootstrap-server kafka:9092

echo ""
echo "========================================="
echo "Topic details:"
echo "========================================="

docker exec kafka kafka-topics \
    --describe \
    --bootstrap-server kafka:9092

echo ""
echo "========================================="
echo "✓ Kafka topics initialization completed!"
echo "========================================="
echo ""
echo "You can access Kafka UI at: http://localhost:8090"
echo ""
echo "Note: Running in KRaft mode (no Zookeeper required)"
echo ""
