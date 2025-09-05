#!/usr/bin/env python3
"""
Cloud proxy server for AgentCore runtime
Runs on port 8081 to provide cloud endpoint functionality
"""

import os
import json
import subprocess
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AgentCore Cloud Proxy")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InvokeRequest(BaseModel):
    prompt: str
    model_id: str = "us.amazon.nova-premier-v1:0"

@app.post("/invocations")
async def invocations(request: InvokeRequest):
    """Cloud proxy using agentcore CLI"""
    try:
        # Use agentcore CLI to invoke the deployed agent
        cmd = [
            "agentcore", "invoke", 
            json.dumps({
                "prompt": request.prompt,
                "model_id": request.model_id
            })
        ]
        
        logger.info(f"Invoking cloud agent with: {request.prompt}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            # Parse the CLI output to extract the actual response
            response_text = result.stdout.strip()
            
            # Extract the actual agent response from the CLI output
            if '"response":' in response_text:
                # Find the response section and extract the actual message
                import re
                match = re.search(r'"response":\s*\[\s*"([^"]+)"', response_text)
                if match:
                    # Decode the escaped JSON
                    escaped_json = match.group(1)
                    # Unescape the JSON
                    unescaped = escaped_json.replace('\\"', '"').replace('\\\\', '\\')
                    try:
                        parsed = json.loads(unescaped)
                        return parsed
                    except:
                        pass
            
            # Fallback: return the raw output
            return {"role": "assistant", "content": [{"text": response_text}]}
        else:
            logger.error(f"AgentCore CLI error: {result.stderr}")
            return {"role": "assistant", "content": [{"text": f"Cloud error: {result.stderr}"}]}
            
    except Exception as e:
        logger.error(f"Cloud invoke error: {e}")
        return {"role": "assistant", "content": [{"text": f"Cloud endpoint error: {str(e)}"}]}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "agentcore-cloud-proxy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
