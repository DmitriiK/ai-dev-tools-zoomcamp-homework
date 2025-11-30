import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_languages(client: AsyncClient):
    """Test getting supported languages."""
    response = await client.get("/api/languages")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "languages" in data
    languages = data["languages"]
    
    # Check that all 5 languages are present
    language_ids = [lang["id"] for lang in languages]
    assert "javascript" in language_ids
    assert "python" in language_ids
    assert "csharp" in language_ids
    assert "go" in language_ids
    assert "java" in language_ids


@pytest.mark.asyncio
async def test_language_structure(client: AsyncClient):
    """Test that languages have the correct structure."""
    response = await client.get("/api/languages")
    languages = response.json()["languages"]
    
    for lang in languages:
        assert "id" in lang
        assert "name" in lang
        assert "version" in lang
        assert "execution_mode" in lang
        assert "runtime" in lang
        assert "file_extension" in lang
        assert "monaco_language" in lang
        
        # All should execute in browser
        assert lang["execution_mode"] == "browser"


@pytest.mark.asyncio
async def test_javascript_language(client: AsyncClient):
    """Test JavaScript language configuration."""
    response = await client.get("/api/languages")
    languages = response.json()["languages"]
    
    js_lang = next(l for l in languages if l["id"] == "javascript")
    
    assert js_lang["name"] == "JavaScript"
    assert js_lang["runtime"] == "Web Worker"
    assert js_lang["file_extension"] == ".js"
    assert js_lang["monaco_language"] == "javascript"


@pytest.mark.asyncio
async def test_python_language(client: AsyncClient):
    """Test Python language configuration."""
    response = await client.get("/api/languages")
    languages = response.json()["languages"]
    
    py_lang = next(l for l in languages if l["id"] == "python")
    
    assert py_lang["name"] == "Python"
    assert "Pyodide" in py_lang["runtime"]
    assert py_lang["file_extension"] == ".py"
    assert py_lang["monaco_language"] == "python"


@pytest.mark.asyncio
async def test_csharp_language(client: AsyncClient):
    """Test C# language configuration."""
    response = await client.get("/api/languages")
    languages = response.json()["languages"]
    
    cs_lang = next(l for l in languages if l["id"] == "csharp")
    
    assert cs_lang["name"] == "C#"
    assert "Blazor" in cs_lang["runtime"]
    assert cs_lang["file_extension"] == ".cs"
    assert cs_lang["monaco_language"] == "csharp"


@pytest.mark.asyncio
async def test_go_language(client: AsyncClient):
    """Test Go language configuration."""
    response = await client.get("/api/languages")
    languages = response.json()["languages"]
    
    go_lang = next(l for l in languages if l["id"] == "go")
    
    assert go_lang["name"] == "Go"
    assert "TinyGo" in go_lang["runtime"]
    assert go_lang["file_extension"] == ".go"
    assert go_lang["monaco_language"] == "go"


@pytest.mark.asyncio
async def test_java_language(client: AsyncClient):
    """Test Java language configuration."""
    response = await client.get("/api/languages")
    languages = response.json()["languages"]
    
    java_lang = next(l for l in languages if l["id"] == "java")
    
    assert java_lang["name"] == "Java"
    assert "CheerpJ" in java_lang["runtime"]
    assert java_lang["file_extension"] == ".java"
    assert java_lang["monaco_language"] == "java"
