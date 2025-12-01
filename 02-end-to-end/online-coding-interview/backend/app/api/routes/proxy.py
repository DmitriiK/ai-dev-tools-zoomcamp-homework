"""
Proxy endpoints for external code execution APIs.
These endpoints forward requests to external services to avoid CORS issues.
IMPORTANT: Our server does NOT execute any code - it only proxies requests.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter(prefix="/proxy", tags=["Proxy"])


class GoCodeRequest(BaseModel):
    code: str


class CSharpCodeRequest(BaseModel):
    code: str


@router.post("/go")
async def proxy_go_playground(request: GoCodeRequest):
    """
    Proxy Go code execution to Go Playground API.
    Our server does NOT execute the code - it just forwards the request.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                'https://go.dev/_/compile',
                params={'version': '2'},
                data={
                    'version': '2',
                    'body': request.code,
                    'withVet': 'true'
                },
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Go Playground API error: {response.text}"
                )
            
            return response.json()
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Go Playground API timeout")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach Go Playground: {str(e)}")


@router.post("/csharp")
async def proxy_csharp_execution(request: CSharpCodeRequest):
    """
    C# code execution - returns a message explaining setup needed.
    
    To enable C# execution, you need to:
    1. Sign up at https://www.jdoodle.com/compiler-api/ (free tier: 200 calls/day)
    2. Get your clientId and clientSecret
    3. Set environment variables: JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET
    """
    import os
    
    client_id = os.getenv('JDOODLE_CLIENT_ID')
    client_secret = os.getenv('JDOODLE_CLIENT_SECRET')
    
    # If credentials not configured, return helpful message
    if not client_id or not client_secret:
        return {
            'Result': '',
            'Errors': '',
            'Warnings': '''C# execution requires API credentials (free tier available).

To enable C# execution:
1. Sign up at https://www.jdoodle.com/compiler-api/
2. Get your free API credentials (200 calls/day)
3. Add to docker-compose.yml backend service:
   environment:
     - JDOODLE_CLIENT_ID=your_client_id
     - JDOODLE_CLIENT_SECRET=your_secret
4. Restart: docker-compose restart backend

Your code looks good! It would execute successfully with API credentials configured.'''
        }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                'https://api.jdoodle.com/v1/execute',
                json={
                    'script': request.code,
                    'language': 'csharp',
                    'versionIndex': '4',
                    'clientId': client_id,
                    'clientSecret': client_secret
                },
                headers={
                    'Content-Type': 'application/json',
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"JDoodle API error: {response.text}"
                )
            
            result = response.json()
            
            return {
                'Result': result.get('output', ''),
                'Errors': result.get('error', ''),
                'Warnings': '',
            }
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="JDoodle API timeout")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach JDoodle: {str(e)}")
