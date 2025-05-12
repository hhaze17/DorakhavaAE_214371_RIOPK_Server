import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Products from '../pages/Products';
import api from '../api';

// Mock the react-router-dom's useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock the API module
jest.mock('../api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
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

describe('Products Component', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Test Product 1',
      description: 'Description for product 1',
      brandName: 'Brand A',
      productModel: 'Model X',
      category: 'Electronics',
      price: 99.99,
      quantity: 50,
      zone: '1',
      status: 'active'
    },
    {
      _id: '2',
      name: 'Test Product 2',
      description: 'Description for product 2',
      brandName: 'Brand B',
      productModel: 'Model Y',
      category: 'Furniture',
      price: 199.99,
      quantity: 3,
      zone: '2',
      status: 'active'
    },
    {
      _id: '3',
      name: 'Test Product 3',
      description: 'Description for product 3',
      brandName: 'Brand C',
      productModel: 'Model Z',
      category: 'Electronics',
      price: 299.99,
      quantity: 0,
      zone: '1',
      status: 'inactive'
    }
  ];

  const mockZones = [
    { _id: '1', name: 'Warehouse Zone', type: 'warehouse' },
    { _id: '2', name: 'Sales Zone', type: 'sales' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Setup mock API responses
    api.get.mockImplementation((endpoint) => {
      if (endpoint === '/products') {
        return Promise.resolve({ data: mockProducts });
      } else if (endpoint === '/zones') {
        return Promise.resolve({ data: mockZones });
      }
      return Promise.resolve({ data: [] });
    });

    api.post.mockResolvedValue({ data: { success: true } });
    api.put.mockResolvedValue({ data: { success: true } });
    api.delete.mockResolvedValue({ data: { success: true } });
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders products table after loading', async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if products are displayed
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('Test Product 3')).toBeInTheDocument();
  });

  test('filters products by search term', async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText('Поиск товаров...') || 
                        screen.getByLabelText('Поиск') ||
                        screen.getByRole('textbox');
    
    fireEvent.change(searchInput, { target: { value: 'Model X' } });
    
    // Check if only matching product is displayed
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Product 3')).not.toBeInTheDocument();
  });

  test('filters products by category', async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Select category filter
    const categorySelect = screen.getByLabelText('Категория') || 
                           screen.getAllByRole('combobox')[0];
    
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    
    // Check if only Electronics products are displayed
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();
    expect(screen.getByText('Test Product 3')).toBeInTheDocument();
  });

  test('shows admin controls when logged in as admin', async () => {
    // Set admin role
    localStorageMock.setItem('role', 'Администратор');
    
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if admin controls are displayed
    const addButton = screen.getByText('Добавить товар') || 
                      screen.getByRole('button', { name: /добавить/i });
    
    expect(addButton).toBeInTheDocument();
    
    // Edit buttons should be visible
    const editButtons = screen.getAllByTestId('edit-button') || 
                        screen.getAllByLabelText('Редактировать');
    
    expect(editButtons.length).toBeGreaterThan(0);
  });

  test('hides admin controls when logged in as client', async () => {
    // Set client role
    localStorageMock.setItem('role', 'Клиент');
    
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check that admin controls are not displayed
    const addButton = screen.queryByText('Добавить товар') || 
                      screen.queryByRole('button', { name: /добавить/i });
    
    expect(addButton).not.toBeInTheDocument();
    
    // Edit buttons should not be visible
    const editButtons = screen.queryAllByTestId('edit-button') || 
                        screen.queryAllByLabelText('Редактировать');
    
    expect(editButtons.length).toBe(0);
  });

  test('handles API error gracefully', async () => {
    // Make API return an error
    api.get.mockImplementation(() => Promise.reject(new Error('API Error')));
    
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки данных о товарах')).toBeInTheDocument();
    });
  });
}); 