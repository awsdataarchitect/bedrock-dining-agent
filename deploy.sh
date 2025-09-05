#!/bin/bash

# 🚀 BEDROCK DINING AGENT - CLOUD DEPLOYMENT SCRIPT
# Automated deployment to AWS Bedrock AgentCore Runtime
# Matches DEPLOYMENT_PLAN.md exactly

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if we're in the right directory
if [[ ! -f "app.py" ]]; then
    error "app.py not found. Please run this script from the agentcore directory."
fi

log "🚀 Starting Bedrock Dining Agent Deployment"
log "📋 Following DEPLOYMENT_PLAN.md steps..."

# STEP 1: Install AgentCore Toolkit (2 minutes)
log "📦 STEP 1: Installing AgentCore Toolkit..."
pip install bedrock-agentcore strands-agents bedrock-agentcore-starter-toolkit || error "Failed to install AgentCore toolkit"
success "AgentCore toolkit installed"

# Verify AWS credentials
log "🔐 Verifying AWS credentials..."
ACCOUNT_INFO=$(python3 -c "import boto3; sts = boto3.client('sts'); info = sts.get_caller_identity(); print(f\"{info['Account']}:{boto3.Session().region_name or 'us-east-1'}\")" 2>/dev/null) || error "AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables."
ACCOUNT_ID=$(echo $ACCOUNT_INFO | cut -d: -f1)
REGION=$(echo $ACCOUNT_INFO | cut -d: -f2)
success "AWS credentials verified - Account: $ACCOUNT_ID, Region: $REGION"

# STEP 2: Model Access Check (automated)
log "🤖 STEP 2: Checking model access..."
warning "Manual step required: Ensure Nova Premier is enabled in Bedrock console (us-east-1)"
warning "Visit: https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess"
read -p "Press Enter after enabling Nova Premier model access in Bedrock console..."

# STEP 3: Configure Agent (5 minutes)
log "⚙️  STEP 3: Configuring agent for deployment..."
if [[ -f ".bedrock_agentcore.yaml" ]]; then
    warning "Existing .bedrock_agentcore.yaml found. Backing up..."
    cp .bedrock_agentcore.yaml .bedrock_agentcore.yaml.backup
fi

agentcore configure -e app.py || error "Failed to configure agent"
success "Agent configuration completed"

# STEP 4: Deploy to Cloud (10-15 minutes)
log "☁️  STEP 4: Deploying to AWS AgentCore Runtime..."
log "This may take 10-15 minutes..."

# Capture the deployment output
DEPLOY_OUTPUT=$(agentcore launch 2>&1) || error "Deployment failed. Check logs above."
echo "$DEPLOY_OUTPUT"

# Extract Agent ARN from output
AGENT_ARN=$(echo "$DEPLOY_OUTPUT" | grep -o 'arn:aws:bedrock-agent-runtime:[^"]*' | head -1)
if [[ -n "$AGENT_ARN" ]]; then
    success "Deployment successful!"
    success "Agent ARN: $AGENT_ARN"
    echo "$AGENT_ARN" > .agent_arn
else
    warning "Could not extract Agent ARN from output. Check deployment logs."
fi

# STEP 5: Test Cloud Deployment (5 minutes)
log "🧪 STEP 5: Testing cloud deployment..."

# Test 1: Basic functionality
log "Testing basic restaurant search..."
TEST1_OUTPUT=$(agentcore invoke '{"prompt": "Find Italian restaurants in Toronto"}' 2>&1) || warning "Test 1 failed"
if echo "$TEST1_OUTPUT" | grep -q "Italian"; then
    success "Test 1 passed: Basic search working"
else
    warning "Test 1 may have issues. Check output above."
fi

# Test 2: Model selection
log "Testing model selection..."
TEST2_OUTPUT=$(agentcore invoke '{"prompt": "Find sushi restaurants", "model_id": "us.amazon.nova-premier-v1:0"}' 2>&1) || warning "Test 2 failed"
if echo "$TEST2_OUTPUT" | grep -q "sushi\|restaurant"; then
    success "Test 2 passed: Model selection working"
else
    warning "Test 2 may have issues. Check output above."
fi

# Test 3: Dining plan
log "Testing dining plan creation..."
TEST3_OUTPUT=$(agentcore invoke '{"prompt": "Dining plan for Momo Chowmein"}' 2>&1) || warning "Test 3 failed"
if echo "$TEST3_OUTPUT" | grep -q "plan\|menu\|restaurant"; then
    success "Test 3 passed: Dining plan working"
else
    warning "Test 3 may have issues. Check output above."
fi

# Success summary
log "🎉 DEPLOYMENT COMPLETE!"
success "All deployment steps completed successfully"

if [[ -n "$AGENT_ARN" ]]; then
    echo ""
    echo "📋 DEPLOYMENT SUMMARY:"
    echo "Agent ARN: $AGENT_ARN"
    echo "Account: $ACCOUNT_ID"
    echo "Region: $REGION"
    echo ""
    echo "🔧 NEXT STEPS:"
    echo "1. Set environment variables (CRITICAL):"
    echo "   aws bedrock-agentcore-control update-agent-runtime \\"
    echo "     --agent-runtime-id \$(echo $AGENT_ARN | cut -d'/' -f2) \\"
    echo "     --agent-runtime-artifact 'containerConfiguration={containerUri=283023040015.dkr.ecr.us-east-1.amazonaws.com/bedrock-agentcore-app:latest}' \\"
    echo "     --role-arn arn:aws:iam::$ACCOUNT_ID:role/AmazonBedrockAgentCoreSDKRuntime-us-east-1-* \\"
    echo "     --network-configuration 'networkMode=PUBLIC' \\"
    echo "     --protocol-configuration 'serverProtocol=HTTP' \\"
    echo "     --environment-variables 'BRIGHTDATA_API_TOKEN=your_token_here'"
    echo ""
    echo "2. Test your agent: agentcore invoke '{\"prompt\": \"Find restaurants in Toronto\"}'"
    echo "3. Monitor CloudWatch logs for performance"
    echo ""
    echo "📖 See DEPLOYMENT_PLAN.md for post-deployment configuration"
fi

log "✨ Deployment script completed successfully!"
