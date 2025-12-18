````md
# Quick Start Guide

## Start in 3 Steps

### 1. Run Docker Compose

```bash
cd /home/rachi/Documents/Project/Windsurf/Enterprise
docker-compose up -d
````

### 2. Wait for all services to start (~2–3 minutes)

Check status:

```bash
docker-compose ps
```

All services should be in the **"Up"** state.

### 3. Open the application

* Frontend: [http://localhost:3000](http://localhost:3000)
* Eureka Dashboard: [http://localhost:8761](http://localhost:8761)

---

## First Steps

### Create an account

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"Register"**
3. Fill in the registration form
4. Log in

### Create test data

```bash
# Create a product (token required)
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "price": 99.99,
    "stock": 100,
    "category": "Test",
    "active": true
  }'
```

### Create an order

1. Go to the **Products** page
2. Select a product
3. Click **"Order Now"**
4. Check the order in the **Orders** section

---

## Useful Commands

```bash
# View all logs
docker-compose logs -f

# View logs of a specific service
docker-compose logs -f user-service

# Stop everything
docker-compose down

# Restart a service
docker-compose restart user-service

# Clear all data
docker-compose down -v
```

---

## Endpoints for Testing

### Registration

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Get products

```bash
curl http://localhost:8080/api/products/active
```

---

## Troubleshooting

**Problem:** A service does not start

**Solution:**

```bash
docker-compose logs service-name
docker-compose restart service-name
```

---

**Problem:** Database is not available

**Solution:**

```bash
docker-compose down -v
docker-compose up -d
```

---

**Problem:** Frontend cannot connect

**Solution:**
Check that the API Gateway is running on port **8080**.

```
:contentReference[oaicite:0]{index=0}
::contentReference[oaicite:1]{index=1}
```
