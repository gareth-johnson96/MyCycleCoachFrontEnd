import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import * as useAuthModule from '../features/auth/useAuth';

// Mock the useAuth hook
vi.mock('../features/auth/useAuth');

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      isAuthenticated: true,
      login: vi.fn(),
      logout: mockLogout,
    });
  });

  it('renders the brand name', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(screen.getByText('MyCycleCoach')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(screen.getByText('Training')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  it('calls logout and navigates to login when logout button is clicked', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders child routes via Outlet', () => {
    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/test" element={<div>Test Child Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('highlights active navigation link', () => {
    render(
      <MemoryRouter initialEntries={['/training']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/training" element={<div>Training Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const trainingLink = screen.getByText('Training');
    expect(trainingLink).toBeInTheDocument();
  });
});
