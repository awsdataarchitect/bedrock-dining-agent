import React, { useState } from 'react';
import EndpointSwitcher from '../components/EndpointSwitcher';
import { apiService } from '../services/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const HomePage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('us.amazon.nova-premier-v1:0');
  const [useCloud, setUseCloud] = useState(false);

  const handleEndpointChange = (isCloud: boolean) => {
    setUseCloud(isCloud);
    apiService.setCloudMode(isCloud);
  };

  const availableModels = [
    { id: 'us.amazon.nova-premier-v1:0', name: 'Nova Premier' },
    { id: 'us.amazon.nova-micro-v1:0', name: 'Nova Micro' },
    { id: 'us.anthropic.claude-sonnet-4-20250514-v1:0', name: 'Claude Sonnet 4' },
    { id: 'us.anthropic.claude-opus-4-1-20250805-v1:0', name: 'Claude Opus 4.1' },
    { id: 'us.openai.gpt-oss-120b-1:0', name: 'GPT-OSS 120B' }
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');
    
    try {
      // Both local and cloud now use the same API call
      // Backend handles routing to local agent or cloud AgentCore
      const endpoint = useCloud ? '/invocations' : '/invocations';
      
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: message,
          model_id: selectedModel 
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.content?.[0]?.text || data.message || 'No response received',
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Error: Backend not available',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Endpoint Switcher */}
      <EndpointSwitcher onEndpointChange={handleEndpointChange} />
      
      {/* Model Selector */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
            Model:
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              backgroundColor: 'white',
              color: '#374151',
              minWidth: '200px'
            }}
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat History */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        border: '1px solid #e5e7eb', 
        borderRadius: '0.5rem', 
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: '#f9fafb'
      }}>
        {chatHistory.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
            Start a conversation by asking about restaurants, dining plans, or food recommendations!
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div key={index} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ 
                fontSize: '1.2rem',
                minWidth: '2rem',
                textAlign: 'center'
              }}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: msg.role === 'user' ? '#3b82f6' : '#059669',
                  marginBottom: '0.25rem'
                }}>
                  {msg.role === 'user' ? 'You' : 'Dining Agent'}
                </div>
                <div style={{ 
                  color: '#374151',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af', 
                  marginTop: '0.25rem' 
                }}>
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>
            <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</div>
            <span style={{ marginLeft: '0.5rem' }}>Thinking...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about restaurants, dining plans, or food recommendations..."
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            resize: 'none',
            minHeight: '2.5rem',
            maxHeight: '6rem'
          }}
          rows={1}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !message.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: loading || !message.trim() ? '#d1d5db' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Quick Prompts */}
      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
        {[
          'Find Italian restaurants in San Francisco',
          'Dining plan for 2 adults + 1 kid at dilse restaurant toronto',
          'Find sushi restaurants in Toronto',
          'Best pizza places in New York'
        ].map((prompt, index) => (
          <button
            key={index}
            onClick={() => setMessage(prompt)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
