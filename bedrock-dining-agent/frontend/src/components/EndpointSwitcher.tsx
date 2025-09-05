import React, { useState } from 'react';

interface EndpointSwitcherProps {
  onEndpointChange?: (isCloud: boolean) => void;
}

const EndpointSwitcher: React.FC<EndpointSwitcherProps> = ({ onEndpointChange }) => {
  const [isCloud, setIsCloud] = useState(false);

  const handleToggle = () => {
    const newIsCloud = !isCloud;
    setIsCloud(newIsCloud);
    onEndpointChange?.(newIsCloud);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${isCloud ? 'bg-blue-500' : 'bg-green-500'}`}></div>
        <div>
          <span className="text-sm font-medium">
            {isCloud ? 'Cloud AgentCore' : 'Local Backend'}
          </span>
          <div className="text-xs text-gray-500">
            {isCloud ? 'arn:aws:bedrock-agentcore:us-east-1:283023040015:runtime/app-AheaYU90JX' : 'localhost:8080'}
          </div>
        </div>
      </div>
      
      <button
        onClick={handleToggle}
        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Switch to {isCloud ? 'Local' : 'Cloud'}
      </button>
    </div>
  );
};

export default EndpointSwitcher;
