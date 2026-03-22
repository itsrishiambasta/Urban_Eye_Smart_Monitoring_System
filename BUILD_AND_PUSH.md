# Build and Push Docker Images to Docker Hub

## Prerequisites
- Docker installed locally
- Docker Hub account
- Push access to your Docker Hub repo

## Steps to Build and Push

### 1. Build Backend Image
```bash
docker build -f Dockerfile.backend -t yourrepo/urba-eye-backend:latest .
docker push yourrepo/urba-eye-backend:latest
```

### 2. Build Frontend Image
```bash
docker build -f Dockerfile.frontend -t yourrepo/urba-eye-frontend:latest .
docker push yourrepo/urba-eye-frontend:latest
```

### 3. Replace Image Names
In `azure-pipelines.yml`, update:
- `yourrepo/urba-eye-backend:latest` → your actual image name
- `yourrepo/urba-eye-frontend:latest` → your actual image name

## Quick Test Locally
```bash
docker compose up
# Open http://localhost:5173 in browser
```

## To Push Specific Version
```bash
docker build -f Dockerfile.backend -t yourrepo/urba-eye-backend:v1.0 .
docker push yourrepo/urba-eye-backend:v1.0
```
