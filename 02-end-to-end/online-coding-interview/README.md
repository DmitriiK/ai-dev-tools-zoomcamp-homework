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
- ✅ **JavaScript**: Native Web Workers - Full support
- ✅ **Python**: Pyodide (~6-8MB) - Full support with standard library
- 🚧 **C#**: Blazor WASM + Roslyn (~3-5MB) - Implementation planned
- 🚧 **Go**: Yaegi interpreter (~5-10MB) - Implementation planned  
- ⚠️ **Java**: Not implemented - See "Language Support Status" below

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

**Note for Colima users:** If you encounter DNS issues when pulling images, restart Colima with proper DNS:
```bash
colima stop && colima start --dns 8.8.8.8
```

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

## Language Support Status

The platform provides syntax highlighting and templates for five languages, but browser-based WASM execution has varying levels of support:

### ✅ Fully Supported

#### JavaScript
- **Technology**: Native Web Workers
- **Download size**: 0 (built into browser)
- **Capabilities**: Full ES2022 support, async/await, modern APIs
- **Status**: Production ready

#### Python  
- **Technology**: Pyodide (CPython compiled to WASM)
- **Download size**: ~6-8MB (one-time, loaded from CDN)
- **Capabilities**: Python 3.11, standard library, numpy/pandas support
- **Status**: Production ready
- **First run**: Takes 2-3 seconds to initialize runtime

### ✅ Working (External API via Backend Proxy)

#### Go
- **Technology**: Go Playground API (proxied through backend)
- **Download size**: 0 (external service)
- **Implementation**: Frontend → Backend proxy → go.dev/compile API
- **Capabilities**: Full Go standard library support
- **Status**: Production ready ✅
- **Note**: Code executes on Google's Go Playground servers, NOT in browser WASM
- **Security**: Backend only proxies requests to avoid CORS, never executes code
- **Future**: Could migrate to Yaegi WASM interpreter for true browser-only execution (~5-10MB)

#### C#
- **Technology**: JDoodle API (proxied through backend)
- **Download size**: 0 (external service)
- **Implementation**: Frontend → Backend proxy → JDoodle API
- **Capabilities**: C# with Mono runtime and standard library
- **Status**: Requires API credentials (free tier: 200 calls/day)
- **Note**: Code executes on JDoodle servers, NOT in browser WASM
- **Security**: Backend only proxies requests to avoid CORS, never executes code
- **Setup Required**:
  1. Sign up at https://www.jdoodle.com/compiler-api/ (free)
  2. Get your `clientId` and `clientSecret`
  3. Add to `docker-compose.yml` backend environment:
     ```yaml
     environment:
       - JDOODLE_CLIENT_ID=your_client_id
       - JDOODLE_CLIENT_SECRET=your_secret
     ```
  4. Restart: `docker-compose restart backend`
- **Without credentials**: Shows helpful setup instructions instead of executing
- **Future**: Could migrate to Blazor WASM + Roslyn for true browser-only execution (~3-5MB)

### ⚠️ Java - Not Planned

#### Why Java execution is not implemented:

1. **No suitable open-source WASM runtime exists**
   - CheerpJ (commercial, ~20-30MB runtime)
   - Doppio (outdated, unmaintained)
   - TeaVM (produces WASM but doesn't include JVM)

2. **Size concerns**
   - Full JVM in WASM would be 20MB+
   - Includes class library, JIT compiler, GC
   - Significant initial load time (5-10 seconds)

3. **Complexity**
   - Requires full JVM implementation
   - Java bytecode compilation toolchain
   - ClassLoader and reflection support

4. **Alternative approaches considered**:
   - **Server-side execution**: Violates security requirement of browser-only execution
   - **Backend proxy to online Java compilers**: Still involves server-side execution
   - **TeaVM transpilation**: Requires pre-compilation, not runtime interpretation

#### Recommendation for Java support

If Java execution is required:
- Use a backend sandbox with Docker containers (isolated execution environment)
- Implement timeout and resource limits
- Document that Java is the exception to "browser-only execution" rule
- Or wait for mature open-source JVM-in-WASM projects

For now, Java is included in the language dropdown with syntax highlighting and templates, but clicking "Run" displays an informative message about implementation challenges.

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
