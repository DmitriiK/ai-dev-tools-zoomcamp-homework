# Online Coding Interview Platform

A real-time collaborative coding interview platform built with React, TypeScript, and FastAPI. All code execution happens safely in the browser using WebAssembly.

## Features

- ✅ **Real-time Collaboration** - Multiple users can edit code simultaneously with live cursor tracking
- ✅ **Browser-based Code Execution** - JavaScript and Python run securely in WASM (C#, Go, Java planned)
- ✅ **Session Management** - Create, share, and protect sessions with passwords
- ✅ **Multi-language Support** - JavaScript, Python, C#, Go, Java with syntax highlighting
- ✅ **Monaco Editor** - VS Code-like editing experience
- ✅ **Secure by Design** - No server-side code execution

## Tech Stack

### Frontend
- React 18 + TypeScript
- Monaco Editor
- Socket.IO Client
- Zustand (state management)
- Tailwind CSS
- Vitest (testing)

### Backend
- FastAPI (Python)
- Socket.IO (python-socketio)
- PostgreSQL
- Redis

### Code Execution (WASM)
- JavaScript: Web Workers
- Python: Pyodide
- C#: Blazor WASM (planned)
- Go: TinyGo WASM (planned)
- Java: CheerpJ (planned)

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

```bash
# Clone the repository
cd online-coding-interview

# Start all services
docker-compose up -d

# Open in browser
open http://localhost:5173
```

### Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run migrations (if using Alembic)
# alembic upgrade head

# Start the server
uvicorn app.main:application --reload
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Running Tests

#### Backend Tests

```bash
cd backend
pip install -r requirements.txt
pytest -v
```

#### Frontend Tests

```bash
cd frontend
npm install
npm test
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
online-coding-interview/
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and Socket services
│   │   │   └── executor/  # WASM code executors
│   │   ├── store/         # Zustand state management
│   │   └── types/         # TypeScript types
│   └── tests/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Configuration, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   └── tests/
├── docker-compose.yml     # Development environment
└── README.md
```

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | Join a session |
| `leave` | Client → Server | Leave a session |
| `code_change` | Bidirectional | Code content changed |
| `cursor_move` | Bidirectional | Cursor position changed |
| `language_change` | Bidirectional | Programming language changed |
| `user_joined` | Server → Client | User joined session |
| `user_left` | Server → Client | User left session |
| `session_state` | Server → Client | Initial session state |

## Security

All code execution happens in the browser using WebAssembly:
- **JavaScript**: Runs in isolated Web Workers
- **Python**: Runs via Pyodide in a sandboxed WASM environment

The server **never** executes user-submitted code, eliminating:
- Remote Code Execution (RCE) vulnerabilities
- Server resource exhaustion attacks
- Need for complex sandboxing on the backend

## License

MIT
