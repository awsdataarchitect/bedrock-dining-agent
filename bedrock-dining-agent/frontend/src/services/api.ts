import { ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const AGENT_ARN = process.env.REACT_APP_AGENT_ARN;

class ApiService {
  private useCloud = false;

  setCloudMode(enabled: boolean) {
    this.useCloud = enabled;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      let url: string;
      
      if (this.useCloud && AGENT_ARN) {
        // Use cloud proxy server on port 8081
        url = `http://localhost:8081/invocations`;
      } else {
        // Local development
        url = `${API_BASE_URL}${endpoint}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Open restaurant website using browser tool
  async openRestaurantWebsite(restaurantName: string, location?: string): Promise<ApiResponse<any>> {
    const message = `Open website for ${restaurantName}${location ? ` in ${location}` : ''}`;

    return this.makeRequest<any>('/invocations', {
      method: 'POST',
      body: JSON.stringify({
        prompt: message
      }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;