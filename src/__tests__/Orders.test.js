import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Orders from '../pages/Orders';
import api from '../api';

// Mock the react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
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

describe('Orders Component', () => {
  const mockOrders = [
    {
      _id: '1',
      orderNumber: 'ORD-001',
      client: {
        _id: 'client1',
        name: 'John Doe',
        email: 'john@example.com'
      },
      items: [
        {
          product: {
            _id: 'prod1',
            name: 'Product 1'
          },
          quantity: 2,
          price: 99.99
        }
      ],
      totalAmount: 199.98,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: '2023-05-15T10:30:00Z'
    },
    {
      _id: '2',
      orderNumber: 'ORD-002',
      client: {
        _id: 'client2',
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      items: [
        {
          product: {
            _id: 'prod2',
            name: 'Product 2'
          },
          quantity: 1,
          price: 149.99
        }
      ],
      totalAmount: 149.99,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: '2023-05-14T14:45:00Z'
    }
  ];

  const mockZones = [
    { _id: 'zone1', name: 'Warehouse Zone', type: 'warehouse' },
    { _id: 'zone2', name: 'Pickup Zone', type: 'pickup' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Setup mock API responses
    api.get.mockImplementation((endpoint) => {
      if (endpoint === '/orders') {
        return Promise.resolve({ data: mockOrders });
      } else if (endpoint === '/zones') {
        return Promise.resolve({ data: mockZones });
      }
      return Promise.resolve({ data: [] });
    });

    api.put.mockResolvedValue({ data: { success: true } });
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders orders table after loading', async () => {
    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if orders are displayed
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('ORD-002')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('filters orders by status', async () => {
    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Select 'completed' status filter
    const statusFilter = screen.getByLabelText('Статус') || 
                         screen.getAllByRole('combobox')[0];
    
    fireEvent.change(statusFilter, { target: { value: 'completed' } });
    
    // Check if only completed orders are displayed
    expect(screen.queryByText('ORD-001')).not.toBeInTheDocument();
    expect(screen.getByText('ORD-002')).toBeInTheDocument();
  });

  test('shows order details when clicking on an order', async () => {
    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click on the first order
    const viewButtons = screen.getAllByLabelText('Просмотр') || 
                        screen.getAllByTestId('view-button');
    
    fireEvent.click(viewButtons[0]);
    
    // Check if order details dialog is shown
    await waitFor(() => {
      expect(screen.getByText('Детали заказа')).toBeInTheDocument();
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('199,98 ₽')).toBeInTheDocument();
    });
  });

  test('allows changing order status when logged in as employee', async () => {
    // Set employee role
    localStorageMock.setItem('role', 'Сотрудник');
    
    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click on the first order to open details
    const viewButtons = screen.getAllByLabelText('Просмотр') || 
                        screen.getAllByTestId('view-button');
    
    fireEvent.click(viewButtons[0]);
    
    // Wait for details dialog
    await waitFor(() => {
      expect(screen.getByText('Детали заказа')).toBeInTheDocument();
    });
    
    // Change status
    const statusSelect = screen.getByLabelText('Изменить статус') || 
                         screen.getAllByRole('combobox').find(el => 
                           el.getAttribute('aria-label') === 'Изменить статус');
    
    fireEvent.change(statusSelect, { target: { value: 'confirmed' } });
    
    // Save changes
    const saveButton = screen.getByText('Сохранить изменения');
    fireEvent.click(saveButton);
    
    // Check if API was called correctly
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/orders/1/status', { status: 'confirmed' });
    });
  });

  test('handles API error gracefully', async () => {
    // Make API return an error
    api.get.mockImplementation(() => Promise.reject(new Error('API Error')));
    
    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки заказов')).toBeInTheDocument();
    });
  });
}); 