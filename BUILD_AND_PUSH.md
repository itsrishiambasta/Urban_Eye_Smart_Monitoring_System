# Build and Push Docker Images to Docker Hub

## Prerequisites
- Docker installed locally
- Docker Hub account
- Push access to your Docker Hub repo

## Steps to Build and Push

### 1. Build Backend Image
```bash
docker build -f Dockerfile.backend -t pritam2004/final-project:01 .
docker push pritam2004/final-project-backend:01
docker run -d --name new -p 5173:5173 --restart unless-stopped pritam2004/final-project:05
 ```

### 2. Build Frontend Image
```bash
docker build -f Dockerfile.frontend -t pritam2004/final-project:05 .
docker push pritam2004/final-project:05
```

### 3. Replace Image Names
In `azure-pipelines.yml`, update:
- `yourrepo/urba-eye-backend:latest` → your actual image name
- `yourrepo/urba-eye-frontend:latest` → your actual image name

## Quick Test Locally
docker compose up
# Open http://localhost:5173 in browser


