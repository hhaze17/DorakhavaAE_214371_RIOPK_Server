import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import api from '../api';

// Mock the API module
jest.mock('../api', () => ({
  get: jest.fn()
}));

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

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Setup mock API responses
    api.get.mockImplementation((endpoint) => {
      switch(endpoint) {
        case '/zones':
          return Promise.resolve({ 
            data: [
              { id: '1', name: 'Zone 1', status: 'active' },
              { id: '2', name: 'Zone 2', status: 'active' },
              { id: '3', name: 'Zone 3', status: 'inactive' }
            ] 
          });
        case '/products':
          return Promise.resolve({ 
            data: [
              { id: '1', name: 'Product 1', quantity: 5 },
              { id: '2', name: 'Product 2', quantity: 15 },
              { id: '3', name: 'Product 3', quantity: 3 }
            ] 
          });
        case '/orders':
          return Promise.resolve({ 
            data: [
              { id: '1', status: 'pending' },
              { id: '2', status: 'completed' },
              { id: '3', status: 'pending' }
            ] 
          });
        default:
          return Promise.resolve({ data: [] });
      }
    });
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders dashboard with admin role', async () => {
    // Set admin role in localStorage
    localStorageMock.setItem('role', 'Администратор');
    localStorageMock.setItem('username', 'Admin User');
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check admin-specific content
    expect(screen.getByText('Управление системой')).toBeInTheDocument();
    expect(screen.getByText('Перейти в панель администратора')).toBeInTheDocument();
    
    // Check stats are displayed correctly
    expect(screen.getByText('3')).toBeInTheDocument(); // Total zones
    expect(screen.getByText('Активных: 2')).toBeInTheDocument();
  });

  test('renders dashboard with employee role', async () => {
    // Set employee role in localStorage
    localStorageMock.setItem('role', 'Сотрудник');
    localStorageMock.setItem('username', 'Employee User');
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check employee-specific content
    expect(screen.getByText('Рабочая область')).toBeInTheDocument();
    expect(screen.getByText('Перейти к задачам')).toBeInTheDocument();
    
    // Check stats are displayed correctly
    expect(screen.getByText('2')).toBeInTheDocument(); // Pending orders
  });

  test('renders dashboard with client role', async () => {
    // Set client role in localStorage
    localStorageMock.setItem('role', 'Клиент');
    localStorageMock.setItem('username', 'Client User');
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check client-specific content
    expect(screen.getByText('Мои покупки')).toBeInTheDocument();
    expect(screen.getByText('Перейти в каталог')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    // Make API return an error
    api.get.mockImplementation(() => Promise.reject(new Error('API Error')));
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки данных')).toBeInTheDocument();
    });
  });
}); 