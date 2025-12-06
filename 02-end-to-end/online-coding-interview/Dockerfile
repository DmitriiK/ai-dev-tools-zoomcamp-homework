# Multi-stage build: Build frontend first
FROM node:20-alpine as frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
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
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ .

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Create startup script
RUN echo '#!/bin/bash\n\
PORT=${PORT:-8080}\n\
echo "Starting on port $PORT"\n\
cat > /etc/nginx/sites-available/default <<EOF\n\
server {\n\
    listen $PORT;\n\
    location / {\n\
        root /app/frontend/dist;\n\
        try_files \$uri \$uri/ /index.html;\n\
    }\n\
    location /api {\n\
        proxy_pass http://localhost:8000;\n\
        proxy_set_header Host \$host;\n\
        proxy_set_header X-Real-IP \$remote_addr;\n\
    }\n\
    location /socket.io {\n\
        proxy_pass http://localhost:8000;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade \$http_upgrade;\n\
        proxy_set_header Connection "upgrade";\n\
    }\n\
}\n\
EOF\n\
nginx -g "daemon off;" &\n\
uvicorn app.main:application --host 0.0.0.0 --port 8000\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE 8080

# Start both nginx and uvicorn
CMD ["/app/start.sh"]
