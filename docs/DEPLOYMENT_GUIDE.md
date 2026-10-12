# Deployment Guide

Deploy TripGenie to production environments (AWS, GCP, Azure, or on-premises).

---

## Pre-Deployment Checklist

- [ ] Database backups configured
- [ ] Environment variables secured (use .env, AWS Secrets, etc.)
- [ ] API keys stored securely
- [ ] HTTPS/SSL configured
- [ ] CORS settings reviewed
- [ ] Rate limiting configured
- [ ] Monitoring & logging set up
- [ ] Database migrations applied
- [ ] Frontend build optimized
- [ ] Error tracking configured (e.g., Sentry)

---

## Docker Deployment (Recommended)

### Build Images

```bash
# Backend
docker build -f backend/Dockerfile -t tripgenie-backend:latest ./backend

# Frontend
docker build -f frontend/Dockerfile -t tripgenie-frontend:latest ./frontend
```

### Push to Registry

```bash
# For Docker Hub
docker tag tripgenie-backend:latest yourusername/tripgenie-backend:latest
docker push yourusername/tripgenie-backend:latest

docker tag tripgenie-frontend:latest yourusername/tripgenie-frontend:latest
docker push yourusername/tripgenie-frontend:latest
```

### Deploy with Docker Compose (Production)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: tripgenie_prod
      POSTGRES_USER: tripgenie
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    ports:
      - "5432:5432"

  backend:
    image: tripgenie-backend:latest
    environment:
      DATABASE_URL: postgresql://tripgenie:${DB_PASSWORD}@postgres:5432/tripgenie_prod
      SECRET_KEY: ${SECRET_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      USE_DEMO_MODE: "False"
      LOG_LEVEL: INFO
    depends_on:
      - postgres
    ports:
      - "8000:8000"
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: tripgenie-frontend:latest
    environment:
      VITE_API_URL: ${API_URL}
    ports:
      - "80:80"
    restart: always
    depends_on:
      - backend

volumes:
  postgres_data:
```

Deploy:

```bash
# Create .env file with production secrets
cp .env.example .env.prod
# Edit .env.prod with real values

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## AWS Deployment (ECS + RDS)

### 1. Create RDS PostgreSQL Database

```bash
aws rds create-db-instance \
  --db-instance-identifier tripgenie-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.0 \
  --master-username tripgenie \
  --master-user-password ${DB_PASSWORD} \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --publicly-accessible false
```

### 2. Push Images to ECR

```bash
# Create ECR repos
aws ecr create-repository --repository-name tripgenie-backend
aws ecr create-repository --repository-name tripgenie-frontend

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag tripgenie-backend:latest \
  ${AWS_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com/tripgenie-backend:latest
docker push ${AWS_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com/tripgenie-backend:latest

# Repeat for frontend
```

### 3. Create ECS Task Definition

Create `ecs-task-definition-backend.json`:

```json
{
  "family": "tripgenie-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "tripgenie-backend",
      "image": "${AWS_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com/tripgenie-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "hostPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://tripgenie:${DB_PASSWORD}@${RDS_ENDPOINT}:5432/tripgenie_prod"
        }
      ],
      "secrets": [
        {
          "name": "SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:${AWS_ACCOUNT}:secret:tripgenie/SECRET_KEY"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/tripgenie-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task definition:

```bash
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition-backend.json
```

### 4. Create ECS Service

```bash
aws ecs create-service \
  --cluster tripgenie-prod \
  --service-name tripgenie-backend \
  --task-definition tripgenie-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxx,subnet-yyy],
    securityGroups=[sg-xxx],
    assignPublicIp=ENABLED
  }" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=tripgenie-backend,containerPort=8000"
```

---

## Google Cloud Run Deployment

### 1. Build and Push to Artifact Registry

```bash
gcloud artifacts repositories create tripgenie \
  --repository-format=docker \
  --location=us-central1

gcloud auth configure-docker us-central1-docker.pkg.dev

docker tag tripgenie-backend:latest \
  us-central1-docker.pkg.dev/${PROJECT_ID}/tripgenie/backend:latest

docker push us-central1-docker.pkg.dev/${PROJECT_ID}/tripgenie/backend:latest
```

### 2. Deploy Backend to Cloud Run

```bash
gcloud run deploy tripgenie-backend \
  --image us-central1-docker.pkg.dev/${PROJECT_ID}/tripgenie/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://...,USE_DEMO_MODE=false" \
  --secrets SECRET_KEY=latest,ANTHROPIC_API_KEY=latest
```

### 3. Deploy Frontend to Cloud Run

```bash
gcloud run deploy tripgenie-frontend \
  --image us-central1-docker.pkg.dev/${PROJECT_ID}/tripgenie/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "VITE_API_URL=https://tripgenie-backend-xxx.run.app"
```

### 4. Configure Cloud SQL

```bash
# Create instance
gcloud sql instances create tripgenie-db \
  --database-version POSTGRES_15 \
  --tier db-f1-micro \
  --region us-central1

# Create database
gcloud sql databases create tripgenie_prod \
  --instance tripgenie-db

# Update connection string
gcloud run services update tripgenie-backend \
  --set-env-vars "DATABASE_URL=postgresql://tripgenie:PASSWORD@/tripgenie_prod?host=/cloudsql/PROJECT:us-central1:tripgenie-db"
```

---

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace tripgenie
kubectl config set-context --current --namespace=tripgenie
```

### 2. Create Secrets

```bash
kubectl create secret generic tripgenie-secrets \
  --from-literal=DATABASE_URL='postgresql://tripgenie:password@postgres:5432/tripgenie_prod' \
  --from-literal=SECRET_KEY='your-secret-key' \
  --from-literal=ANTHROPIC_API_KEY='your-api-key'
```

### 3. Create PostgreSQL StatefulSet

```yaml
# postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: tripgenie_prod
        - name: POSTGRES_USER
          value: tripgenie
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: tripgenie-secrets
              key: DB_PASSWORD
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

Deploy:

```bash
kubectl apply -f postgres-statefulset.yaml
```

### 4. Create Backend Deployment

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tripgenie-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tripgenie-backend
  template:
    metadata:
      labels:
        app: tripgenie-backend
    spec:
      containers:
      - name: backend
        image: tripgenie-backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - secretRef:
            name: tripgenie-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10
```

Deploy:

```bash
kubectl apply -f backend-deployment.yaml
```

### 5. Create Service

```yaml
# backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: tripgenie-backend
spec:
  selector:
    app: tripgenie-backend
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
  type: LoadBalancer
```

Deploy:

```bash
kubectl apply -f backend-service.yaml
kubectl get service tripgenie-backend
```

---

## Environment Configuration

### Production .env

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/tripgenie_prod

# Security
SECRET_KEY=your-very-secure-random-key-min-32-chars
USE_DEMO_MODE=False

# API Keys
ANTHROPIC_API_KEY=sk-xxx...

# Server
LOG_LEVEL=INFO
ALLOWED_HOSTS=api.tripgenie.com,www.tripgenie.com

# CORS
CORS_ORIGINS=https://tripgenie.com,https://www.tripgenie.com

# JWT
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# External Services
SENTRY_DSN=https://xxx@sentry.io/yyy
```

---

## Monitoring & Logging

### 1. Application Monitoring (Prometheus)

```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'tripgenie-backend'
    static_configs:
      - targets: ['localhost:8000']
```

### 2. Structured Logging

Update `backend/app/core/logging.py`:

```python
import json
import logging

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module
        }
        return json.dumps(log_data)

# Configure JSON logging
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logging.getLogger().addHandler(handler)
```

### 3. Error Tracking (Sentry)

```python
# backend/app/main.py
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=0.1,
    environment="production"
)
```

---

## Database Migrations

### Apply Migrations

```bash
# SSH into backend container
docker exec tripgenie-backend bash

# Run migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "Add new column"
alembic upgrade head
```

---

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

```nginx
# /etc/nginx/sites-available/tripgenie
server {
    listen 80;
    server_name api.tripgenie.com;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.tripgenie.com;

    ssl_certificate /etc/letsencrypt/live/api.tripgenie.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tripgenie.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Obtain certificate:

```bash
certbot certonly --standalone -d api.tripgenie.com
```

---

## Backup & Recovery

### PostgreSQL Backup

```bash
# Full backup
pg_dump -U tripgenie tripgenie_prod > backup_$(date +%Y%m%d).sql

# Backup to S3
pg_dump -U tripgenie tripgenie_prod | gzip | aws s3 cp - s3://tripgenie-backups/backup_$(date +%Y%m%d).sql.gz

# Restore from backup
gunzip < backup_20240101.sql.gz | psql -U tripgenie tripgenie_prod
```

### Automated Backups (cron)

```bash
# /etc/cron.d/tripgenie-backup
0 2 * * * postgres pg_dump -U tripgenie tripgenie_prod | gzip > /backups/tripgenie_$(date +\%Y\%m\%d).sql.gz
```

---

## Scaling Guidelines

### Horizontal Scaling

- **Backend**: Add more API instances behind load balancer
- **Database**: Read replicas for read-heavy workloads
- **Frontend**: CDN (CloudFront, Cloudflare) for static assets

### Vertical Scaling

Adjust resource limits based on load:

```yaml
resources:
  requests:
    cpu: "1"
    memory: "2Gi"
  limits:
    cpu: "2"
    memory: "4Gi"
```

---

## Production Checklist

- [ ] Use strong database password
- [ ] Enable database backups (daily)
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring and alerting
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up error tracking (Sentry)
- [ ] Enable CORS only for trusted domains
- [ ] Use environment-specific configs
- [ ] Test disaster recovery procedures
- [ ] Set up staging environment
- [ ] Document deployment procedures
- [ ] Create runbooks for common issues

---

**Questions? Check the main README or SETUP_GUIDE.md**
