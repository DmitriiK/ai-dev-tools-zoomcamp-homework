from fastapi import APIRouter
from app.schemas.session import LanguageInfo, LanguagesResponse

router = APIRouter(prefix="/languages", tags=["Languages"])

# Supported languages with their WASM runtimes
SUPPORTED_LANGUAGES = [
    LanguageInfo(
        id="javascript",
        name="JavaScript",
        version="ES2022",
        execution_mode="browser",
        runtime="Web Worker",
        file_extension=".js",
        monaco_language="javascript",
    ),
    LanguageInfo(
        id="python",
        name="Python",
        version="3.11 (Pyodide)",
        execution_mode="browser",
        runtime="Pyodide WASM",
        file_extension=".py",
        monaco_language="python",
    ),
    LanguageInfo(
        id="csharp",
        name="C#",
        version=".NET 8",
        execution_mode="browser",
        runtime="Blazor WASM",
        file_extension=".cs",
        monaco_language="csharp",
    ),
    LanguageInfo(
        id="go",
        name="Go",
        version="1.21 (TinyGo)",
        execution_mode="browser",
        runtime="TinyGo WASM",
        file_extension=".go",
        monaco_language="go",
    ),
    LanguageInfo(
        id="java",
        name="Java",
        version="11 (CheerpJ)",
        execution_mode="browser",
        runtime="CheerpJ WASM",
        file_extension=".java",
        monaco_language="java",
    ),
]


@router.get("", response_model=LanguagesResponse)
async def get_languages():
    """Get list of supported programming languages."""
    return LanguagesResponse(languages=SUPPORTED_LANGUAGES)
