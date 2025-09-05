import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

os.environ["BYPASS_TOOL_CONSENT"] = "true"

from strands.models import BedrockModel
from strands import Agent, tool
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from bedrock_agentcore.tools.browser_client import BrowserClient
import boto3
from fastapi.middleware.cors import CORSMiddleware
import json
import random
import re
import logging
import asyncio
from mcp import ClientSession
from mcp.client.sse import sse_client

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create AgentCore app with MCP support
app = BedrockAgentCoreApp()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_response(text: str) -> str:
    """Remove thinking tags and fix formatting for UI"""
    cleaned = re.sub(r'<thinking>.*?</thinking>', '', text, flags=re.DOTALL)
    
    # Fix common formatting issues
    cleaned = cleaned.replace('\\n', '\n')  # Convert escaped newlines
    cleaned = re.sub(r'\n\s*\n\s*\n+', '\n\n', cleaned)  # Remove excessive blank lines
    cleaned = re.sub(r'^\s+', '', cleaned, flags=re.MULTILINE)  # Remove leading spaces
    
    return cleaned.strip()

# Create Bedrock model - will be created dynamically per request
# bedrockmodel = BedrockModel(
#     model_id="us.amazon.nova-premier-v1:0",
#     temperature=0.7,
#     streaming=False,
#     boto_session=boto3.Session()
# )

# MCP Client for BrightData tools
# Create MCP tool wrappers for Strands Agent
@tool
def search_engine(query: str, engine: str = "google") -> str:
    """Search for information using Google, Bing, or Yandex search engines."""
    logger.info(f"🔍 TOOL CALLED: search_engine(query='{query}', engine='{engine}')")
    try:
        result = asyncio.run(call_mcp_tool("search_engine", {"query": query, "engine": engine}))
        logger.info(f"🔍 SEARCH RESULT: {len(result)} characters returned")
        return result
    except Exception as e:
        logger.error(f"Error calling search_engine: {e}")
        return f"Search failed: {e}"

@tool  
def scrape_as_markdown(url: str) -> str:
    """Scrape a webpage and return content as markdown."""
    logger.info(f"📋 TOOL CALLED: scrape_as_markdown(url='{url}')")
    try:
        result = asyncio.run(call_mcp_tool("scrape_as_markdown", {"url": url}))
        logger.info(f"📋 SCRAPE RESULT: {len(result)} characters returned")
        return result
    except Exception as e:
        logger.error(f"Error calling scrape_as_markdown: {e}")
        return f"Scraping failed: {e}"

@tool
def create_dining_plan(restaurant_name: str, restaurant_url: str = "") -> str:
    """Create a dining plan with menu items and bill estimate for a restaurant."""
    logger.info(f"💰 TOOL CALLED: create_dining_plan(restaurant_name='{restaurant_name}', restaurant_url='{restaurant_url}')")
    try:
        party_size = "2 adults and 1 kid"  # Fixed party size
        logger.info(f"🍽️ DINING PLAN: Starting for {party_size} at {restaurant_name}")
        
        # If no URL provided, search for the restaurant first
        if not restaurant_url:
            logger.info(f"🔍 NO URL PROVIDED: Searching for {restaurant_name} website")
            search_result = search_engine(f"{restaurant_name} menu website", "google")
            
            # Try to extract a menu URL from search results
            import re
            urls = re.findall(r'https?://[^\s<>"]+', search_result)
            menu_urls = [url for url in urls if any(keyword in url.lower() for keyword in ['menu', 'food', restaurant_name.lower().replace(' ', '')])]
            
            if menu_urls:
                restaurant_url = menu_urls[0]
                logger.info(f"🌐 FOUND URL: Using {restaurant_url}")
            else:
                logger.error(f"❌ NO MENU URL FOUND: Could not find menu URL for {restaurant_name}")
                return f"""🍽️ **Dining Plan Request for {restaurant_name}**

I found information about {restaurant_name} but need a direct menu URL to create a detailed dining plan.

**Search Results:**
{search_result[:500]}...

**To create a dining plan, please:**
1. Provide the restaurant's menu URL, or
2. Let me search for more specific menu information

**Example:** "Create dining plan for {restaurant_name} using menu from [URL]" """
        
        # If no restaurant specified, ask user to specify or search for one
        if not restaurant_name:
            logger.info(f"🔍 NO RESTAURANT: Need to search for restaurant first")
            return f"""🍽️ **Dining Plan Request**

To create a personalized dining plan for {party_size}, I need to know which restaurant you'd like to visit.

**Please either:**
1. **Specify a restaurant**: "Create dining plan for [Restaurant Name]"
2. **Let me search**: "Find restaurants near me" (then I'll create a plan for one of them)

**Example requests:**
- "Dining plan for Momo Chowmein"  
- "Find Hakka restaurants in Etobicoke, then create dining plan"

Once you specify a restaurant, I'll:
🌐 Find their menu online
💰 Create itemized bill with correct tax rates
🍽️ Suggest family-friendly portions"""

        logger.info(f"🌐 SCRAPING: Attempting to scrape menu from {restaurant_url}")
        
        # First, scrape the restaurant menu
        menu_content = scrape_as_markdown(restaurant_url)
        
        logger.info(f"📄 MENU DATA: Retrieved {len(menu_content)} characters")
        logger.info(f"📄 MENU PREVIEW: {menu_content[:200]}...")
        
        if "failed" in menu_content.lower() or len(menu_content) < 100:
            logger.error(f"❌ MENU SCRAPING FAILED: Content too short or failed")
            return f"Could not access menu for {restaurant_name}. Please provide a direct menu URL or try a different restaurant."
        
        # Determine tax rate based on restaurant location using search
        logger.info(f"🔍 LOCATION SEARCH: Searching for restaurant location")
        location_search = search_engine(f"{restaurant_name} location address", "google")
        
        # Check if restaurant is in Canada based on search results
        is_canadian = any(keyword in location_search.lower() for keyword in [
            "canada", "ontario", "quebec", "british columbia", "alberta", 
            "manitoba", "saskatchewan", "nova scotia", "new brunswick",
            "toronto", "vancouver", "montreal", "calgary", "ottawa",
            "mississauga", "winnipeg", "edmonton", "hamilton", "etobicoke"
        ])
        
        tax_rate = 13 if is_canadian else 8.5
        location_info = "Canada (13% HST)" if is_canadian else "US (8.5% tax)"
        
        logger.info(f"🏢 LOCATION: Detected as {location_info}")
        logger.info(f"💰 TAX RATE: Using {tax_rate}%")
        
        return f"""🍽️ **Dining Plan Analysis for {restaurant_name}**

**✅ Menu Successfully Found and Scraped!**
**Menu URL:** {restaurant_url}
**Content Retrieved:** {len(menu_content)} characters
**Location:** {location_info}
**Tax Rate:** {tax_rate}%

**Menu Preview:**
{menu_content[:500]}...

**✅ REAL MENU DATA CONFIRMED**
This is actual scraped content from {restaurant_url}, not generated data.

**Next:** Ready to create itemized dining plan using actual menu items and correct {tax_rate}% tax rate for {party_size}."""
        
    except Exception as e:
        logger.error(f"❌ DINING PLAN ERROR: {e}")
        return f"Failed to create dining plan: {e}"

async def call_mcp_tool(tool_name: str, arguments: dict) -> str:
    """Call an MCP tool and return the result."""
    try:
        api_token = os.getenv('BRIGHTDATA_API_TOKEN')
        if not api_token:
            raise ValueError("BRIGHTDATA_API_TOKEN environment variable not set")
        
        mcp_url = f"https://mcp.brightdata.com/sse?token={api_token}"
        
        async with sse_client(mcp_url) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                
                result = await session.call_tool(tool_name, arguments)
                return str(result.content[0].text) if result.content else "No result"
                
    except Exception as e:
        logger.error(f"MCP tool call failed: {e}")
        return f"Tool call failed: {e}"
def create_agent_with_mcp(model_id: str = "us.amazon.nova-premier-v1:0"):
    """Create agent with MCP tools loaded"""
    try:        
        # Handle region-specific models
        if "openai.gpt-oss" in model_id:
            # GPT-OSS models need us-west-2 region - create session with specific region
            gpt_session = boto3.Session(region_name="us-west-2")
            bedrockmodel = BedrockModel(
                model_id="openai.gpt-oss-120b-1:0",
                temperature=0.7,
                streaming=False,
                boto_session=gpt_session
            )
        else:
            # Other models use cross-region inference
            bedrockmodel = BedrockModel(
                model_id=model_id,
                temperature=0.7,
                streaming=False,
                boto_session=boto3.Session()
            )
        
        agent = Agent(
            model=bedrockmodel, 
            tools=[search_engine, scrape_as_markdown, create_dining_plan],  # Added new tool
            system_prompt="""You are a sophisticated dining assistant with access to BrightData MCP tools.

TOOL USAGE RULES:
🔍 SEARCH TOOL: Use search_engine when user asks to "find", "search", "locate" restaurants
📋 SCRAPE TOOL: Use scrape_as_markdown when you have a specific URL to get menu content
💰 DINING PLAN TOOL: Use create_dining_plan ONLY when user explicitly asks for "dining plan", "meal plan", "bill estimate" AND you have both restaurant name and URL

WORKFLOW:
1. User asks "Find restaurants" → Use search_engine tool
2. User asks "Dining plan for [restaurant]" → Use create_dining_plan tool (requires restaurant name + URL)
3. User provides URL to scrape → Use scrape_as_markdown tool

EXAMPLES:
- "Find Italian restaurants in Toronto" → search_engine(query="Italian restaurants Toronto", engine="google")
- "Dining plan for Scaddabush" → create_dining_plan(restaurant_name="Scaddabush", restaurant_url="https://scaddabush.com/menu/")
- User gives you a menu URL → scrape_as_markdown(url="https://example.com/menu")

CRITICAL: Always use search_engine for finding/locating restaurants. Only use create_dining_plan when user specifically requests a dining plan AND you have the restaurant details."""
        )
        
        logger.info(f"🤖 Agent created with MCP tool wrappers using model: {model_id}")
        logger.info(f"🔧 Available tools: {[tool.__name__ for tool in [search_engine, scrape_as_markdown, create_dining_plan]]}")
        return agent
        
    except Exception as e:
        logger.error(f"Failed to create agent with MCP tools: {e}")
        # Fallback to agent without tools
        if "openai.gpt-oss" in model_id:
            gpt_session = boto3.Session(region_name="us-west-2")
            model = BedrockModel(model_id="openai.gpt-oss-120b-1:0", boto_session=gpt_session)
        else:
            model = BedrockModel(model_id=model_id)
        return Agent(
            model=model, 
            tools=[],
            system_prompt="I'm a dining assistant but currently don't have access to search tools. Please try again later."
        )

@app.entrypoint
def main(payload):
    """Handler for agent invocation"""
    logger.info(f"📥 Received request: {payload}")
    user_message = payload.get("prompt", "No prompt found in input, please guide customer to create a json payload with prompt key")
    model_id = payload.get("model_id", "us.amazon.nova-premier-v1:0")  # Default to Nova Premier
    logger.info(f"🗣️ Processing message: {user_message}")
    logger.info(f"🤖 Using model: {model_id}")
    
    # Create agent with specified model
    agent = create_agent_with_mcp(model_id)
    
    logger.info(f"🤖 Calling agent with available tools: {[tool.__name__ for tool in agent.tools] if hasattr(agent, 'tools') else 'No tools found'}")
    result = agent(user_message)
    logger.info(f"📤 Agent response: {result}")
    
    # Clean the response to remove thinking tags
    if hasattr(result, 'message') and result.message:
        if isinstance(result.message, dict) and 'content' in result.message:
            for content in result.message['content']:
                if 'text' in content:
                    content['text'] = clean_response(content['text'])
        elif isinstance(result.message, str):
            result.message = clean_response(result.message)
    
    return result.message

if __name__ == "__main__":
    logger.info("Starting Bedrock Dining Agent...")
    app.run()
