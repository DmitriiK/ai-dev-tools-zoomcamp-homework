import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_session(client: AsyncClient):
    """Test creating a new session."""
    response = await client.post(
        "/api/sessions",
        json={
            "title": "Test Interview",
            "language": "python",
        },
    )
    
    assert response.status_code == 201
    data = response.json()
    
    assert data["title"] == "Test Interview"
    assert data["language"] == "python"
    assert data["code"] == ""
    assert data["is_active"] is True
    assert "id" in data
    assert "share_url" in data


@pytest.mark.asyncio
async def test_create_session_with_initial_code(client: AsyncClient):
    """Test creating a session with initial code."""
    initial_code = "def hello():\n    print('Hello, World!')"
    
    response = await client.post(
        "/api/sessions",
        json={
            "title": "Code Interview",
            "language": "python",
            "initial_code": initial_code,
        },
    )
    
    assert response.status_code == 201
    data = response.json()
    
    assert data["code"] == initial_code


@pytest.mark.asyncio
async def test_get_session(client: AsyncClient):
    """Test getting session details."""
    # Create a session first
    create_response = await client.post(
        "/api/sessions",
        json={"title": "Get Test Session", "language": "go"},
    )
    session_id = create_response.json()["id"]
    
    # Get the session
    response = await client.get(f"/api/sessions/{session_id}")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["id"] == session_id
    assert data["title"] == "Get Test Session"
    assert data["language"] == "go"


@pytest.mark.asyncio
async def test_get_session_not_found(client: AsyncClient):
    """Test getting a non-existent session."""
    response = await client.get("/api/sessions/00000000-0000-0000-0000-000000000000")
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Session not found"


@pytest.mark.asyncio
async def test_update_session(client: AsyncClient):
    """Test updating a session."""
    # Create a session
    create_response = await client.post(
        "/api/sessions",
        json={"title": "Original Title", "language": "javascript"},
    )
    session_id = create_response.json()["id"]
    
    # Update the session
    response = await client.patch(
        f"/api/sessions/{session_id}",
        json={
            "title": "Updated Title",
            "code": "console.log('Hello');",
        },
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["title"] == "Updated Title"
    assert data["code"] == "console.log('Hello');"
    assert data["language"] == "javascript"  # Unchanged


@pytest.mark.asyncio
async def test_update_session_language(client: AsyncClient):
    """Test updating session language."""
    # Create a session
    create_response = await client.post(
        "/api/sessions",
        json={"title": "Language Test", "language": "javascript"},
    )
    session_id = create_response.json()["id"]
    
    # Update the language
    response = await client.patch(
        f"/api/sessions/{session_id}",
        json={"language": "python"},
    )
    
    assert response.status_code == 200
    assert response.json()["language"] == "python"


@pytest.mark.asyncio
async def test_delete_session(client: AsyncClient):
    """Test deleting a session."""
    # Create a session
    create_response = await client.post(
        "/api/sessions",
        json={"title": "Delete Test", "language": "go"},
    )
    session_id = create_response.json()["id"]
    
    # Delete the session
    response = await client.delete(f"/api/sessions/{session_id}")
    
    assert response.status_code == 204
    
    # Verify it's deleted
    get_response = await client.get(f"/api/sessions/{session_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_session_not_found(client: AsyncClient):
    """Test deleting a non-existent session."""
    response = await client.delete("/api/sessions/00000000-0000-0000-0000-000000000000")
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_session_validation_error(client: AsyncClient):
    """Test creating session with invalid data."""
    response = await client.post(
        "/api/sessions",
        json={
            "title": "",  # Empty title should fail
            "language": "javascript",
        },
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_session_invalid_language(client: AsyncClient):
    """Test creating session with invalid language."""
    response = await client.post(
        "/api/sessions",
        json={
            "title": "Test",
            "language": "rust",  # Not supported
        },
    )
    
    assert response.status_code == 422
