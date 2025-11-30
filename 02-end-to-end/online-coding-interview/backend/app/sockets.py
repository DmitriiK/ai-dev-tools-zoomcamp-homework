import socketio
from app.core.redis import get_redis
import json
import uuid
from datetime import datetime

# Create Socket.IO server with async support
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
)

# User colors for cursor highlighting
CURSOR_COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
]


def get_random_color() -> str:
    """Get a random cursor color."""
    import random
    return random.choice(CURSOR_COLORS)


@sio.event
async def connect(sid, environ):
    """Handle client connection."""
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    """Handle client disconnection."""
    print(f"Client disconnected: {sid}")
    
    # Get Redis client
    redis = await get_redis()
    
    # Find which session this user was in
    session_id = await redis.get(f"user:{sid}:session")
    if session_id:
        # Remove user from session
        await redis.srem(f"session:{session_id}:participants", sid)
        await redis.hdel(f"session:{session_id}:cursors", sid)
        await redis.hdel(f"session:{session_id}:users", sid)
        await redis.delete(f"user:{sid}:session")
        
        # Notify other users
        user_data = await redis.hget(f"session:{session_id}:users", sid)
        await sio.emit(
            "user_left",
            {"user_id": sid},
            room=session_id,
            skip_sid=sid,
        )


@sio.event
async def join(sid, data):
    """Handle user joining a session."""
    session_id = data.get("session_id")
    user_name = data.get("name", f"User-{sid[:6]}")
    
    if not session_id:
        await sio.emit("error", {"message": "Session ID required"}, to=sid)
        return
    
    redis = await get_redis()
    
    # Join the Socket.IO room
    sio.enter_room(sid, session_id)
    
    # Store user info in Redis
    user_data = {
        "id": sid,
        "name": user_name,
        "color": get_random_color(),
        "joined_at": datetime.utcnow().isoformat(),
    }
    
    await redis.sadd(f"session:{session_id}:participants", sid)
    await redis.hset(f"session:{session_id}:users", sid, json.dumps(user_data))
    await redis.set(f"user:{sid}:session", session_id)
    
    # Get current code from Redis (if any)
    current_code = await redis.get(f"session:{session_id}:code")
    current_language = await redis.get(f"session:{session_id}:language")
    
    # Get all participants
    participants = []
    participant_ids = await redis.smembers(f"session:{session_id}:participants")
    for pid in participant_ids:
        pdata = await redis.hget(f"session:{session_id}:users", pid)
        if pdata:
            participants.append(json.loads(pdata))
    
    # Send current state to the joining user
    await sio.emit(
        "session_state",
        {
            "code": current_code or "",
            "language": current_language or "javascript",
            "participants": participants,
            "your_id": sid,
            "your_color": user_data["color"],
        },
        to=sid,
    )
    
    # Notify other users
    await sio.emit(
        "user_joined",
        user_data,
        room=session_id,
        skip_sid=sid,
    )
    
    print(f"User {sid} ({user_name}) joined session {session_id}")


@sio.event
async def leave(sid, data):
    """Handle user leaving a session."""
    session_id = data.get("session_id")
    if session_id:
        sio.leave_room(sid, session_id)
        
        redis = await get_redis()
        await redis.srem(f"session:{session_id}:participants", sid)
        await redis.hdel(f"session:{session_id}:cursors", sid)
        await redis.hdel(f"session:{session_id}:users", sid)
        await redis.delete(f"user:{sid}:session")
        
        await sio.emit(
            "user_left",
            {"user_id": sid},
            room=session_id,
            skip_sid=sid,
        )


@sio.event
async def code_change(sid, data):
    """Handle code changes from a client."""
    session_id = data.get("session_id")
    code = data.get("code", "")
    
    if not session_id:
        return
    
    redis = await get_redis()
    
    # Store current code in Redis
    await redis.set(f"session:{session_id}:code", code)
    
    # Broadcast to other users in the session
    await sio.emit(
        "code_change",
        {"code": code, "user_id": sid},
        room=session_id,
        skip_sid=sid,
    )


@sio.event
async def cursor_move(sid, data):
    """Handle cursor movement from a client."""
    session_id = data.get("session_id")
    position = data.get("position")  # {line, column}
    
    if not session_id or not position:
        return
    
    redis = await get_redis()
    
    # Store cursor position in Redis
    await redis.hset(
        f"session:{session_id}:cursors",
        sid,
        json.dumps(position),
    )
    
    # Broadcast to other users
    await sio.emit(
        "cursor_move",
        {"user_id": sid, "position": position},
        room=session_id,
        skip_sid=sid,
    )


@sio.event
async def language_change(sid, data):
    """Handle language change from a client."""
    session_id = data.get("session_id")
    language = data.get("language")
    
    if not session_id or not language:
        return
    
    redis = await get_redis()
    
    # Store language in Redis
    await redis.set(f"session:{session_id}:language", language)
    
    # Broadcast to other users
    await sio.emit(
        "language_change",
        {"language": language, "user_id": sid},
        room=session_id,
        skip_sid=sid,
    )


@sio.event
async def selection_change(sid, data):
    """Handle selection changes from a client."""
    session_id = data.get("session_id")
    selection = data.get("selection")  # {startLine, startColumn, endLine, endColumn}
    
    if not session_id:
        return
    
    # Broadcast to other users
    await sio.emit(
        "selection_change",
        {"user_id": sid, "selection": selection},
        room=session_id,
        skip_sid=sid,
    )
