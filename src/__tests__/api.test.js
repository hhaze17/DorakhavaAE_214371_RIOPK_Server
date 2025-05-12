import axios from 'axios';
import api from '../api';

// Mock axios
jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    }))
  };
});

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('API Module', () => {
  let requestInterceptor;
  let responseSuccessInterceptor;
  let responseErrorInterceptor;
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Capture the interceptors
    const mockAxiosInstance = axios.create();
    requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    
    const responseMockCalls = mockAxiosInstance.interceptors.response.use.mock.calls[0];
    responseSuccessInterceptor = responseMockCalls[0];
    responseErrorInterceptor = responseMockCalls[1];
  });
  
  test('axios.create is called with the correct base URL', () => {
    // Import the module again to trigger the axios.create call
    jest.isolateModules(() => {
      require('../api');
    });
    
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: expect.any(String)
    });
  });
  
  test('request interceptor adds auth token when available', () => {
    // Set up localStorage with a token
    localStorageMock.setItem('token', 'test-token-123');
    
    const config = { headers: {} };
    const result = requestInterceptor(config);
    
    expect(result.headers['Authorization']).toBe('Bearer test-token-123');
  });
  
  test('request interceptor adds user ID headers', () => {
    // Set up localStorage with a user ID
    localStorageMock.setItem('userId', '123');
    
    const config = { headers: {} };
    const result = requestInterceptor(config);
    
    expect(result.headers['X-User-ID']).toBe('123');
    expect(result.headers['User-ID']).toBe('123');
  });
  
  test('request interceptor uses fallback ID when no user ID is available', () => {
    // No user ID in localStorage
    const config = { headers: {} };
    const result = requestInterceptor(config);
    
    // Should use fallback ID
    expect(result.headers['X-User-ID']).toBe('68201e606f03088f8250d6ae');
    expect(result.headers['User-ID']).toBe('68201e606f03088f8250d6ae');
    
    // Should store the fallback ID in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', '68201e606f03088f8250d6ae');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('_id', '68201e606f03088f8250d6ae');
  });
  
  test('response interceptor passes through successful responses', () => {
    const response = { data: { success: true } };
    const result = responseSuccessInterceptor(response);
    
    expect(result).toBe(response);
  });
  
  test('response error interceptor logs error and rejects promise', async () => {
    // Mock console.error to check if it's called
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const error = {
      config: { url: '/test', method: 'GET' },
      response: { status: 404, data: { message: 'Not found' } }
    };
    
    try {
      await responseErrorInterceptor(error);
      // Should not reach here
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBe(error);
      expect(console.error).toHaveBeenCalledWith('API Error:', expect.objectContaining({
        url: '/test',
        method: 'GET',
        status: 404
      }));
    }
    
    // Restore console.error
    console.error = originalConsoleError;
  });
}); 