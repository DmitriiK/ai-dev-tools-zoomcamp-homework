# Multi-stage build: Build frontend first
FROM node:20-alpine as frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY 02-end-to-end/online-coding-interview/frontend/package*.json ./
RUN npm ci

COPY 02-end-to-end/online-coding-interview/frontend/ ./
RUN npm run build

# Backend stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including nginx for serving frontend
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY 02-end-to-end/online-coding-interview/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY 02-end-to-end/online-coding-interview/backend/ .

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Configure nginx to serve frontend and proxy backend
RUN echo 'server { \
    listen 8080; \
    location / { \
        root /app/frontend/dist; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://localhost:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    location /socket.io { \
        proxy_pass http://localhost:8000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
    } \
}' > /etc/nginx/sites-available/default

# Expose port (Render uses PORT env var)
EXPOSE 8080

# Start both nginx and uvicorn
CMD nginx && uvicorn app.main:application --host 0.0.0.0 --port 8000
