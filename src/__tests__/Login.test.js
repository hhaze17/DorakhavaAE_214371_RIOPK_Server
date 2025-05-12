import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import api from '../api';

// Mock the react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock the API module
jest.mock('../api', () => ({
  post: jest.fn()
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

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Вход в систему')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Try to submit with empty fields
    const submitButton = screen.getByRole('button', { name: /войти/i });
    fireEvent.click(submitButton);
    
    // Expect validation errors
    await waitFor(() => {
      expect(screen.getByText(/email обязателен/i)).toBeInTheDocument();
      expect(screen.getByText(/пароль обязателен/i)).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    // Mock successful login response
    const mockUser = {
      _id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'Администратор'
    };
    
    api.post.mockResolvedValueOnce({
      data: {
        token: 'fake-token-123',
        user: mockUser
      }
    });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Fill in the form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Wait for the login process to complete
    await waitFor(() => {
      // Check if API was called correctly
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Check if localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'fake-token-123');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', '123');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('role', 'Администратор');
      
      // Check if navigation happened
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles login error', async () => {
    // Mock failed login
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Неверный email или пароль'
        }
      }
    });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Fill in the form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument();
    });
    
    // Check localStorage was not updated
    expect(localStorageMock.setItem).not.toHaveBeenCalledWith('token', expect.anything());
  });

  test('navigates to register page when clicking register link', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const registerLink = screen.getByText(/зарегистрироваться/i);
    fireEvent.click(registerLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});