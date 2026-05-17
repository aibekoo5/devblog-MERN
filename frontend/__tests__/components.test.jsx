/**
 * Frontend React component tests
 * Integration tests using React Testing Library
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Mock Next.js modules ────────────────────────────────────────────────────
jest.mock('next/link', () => {
  const Link = ({ children, href }) => <a href={href}>{children}</a>;
  Link.displayName = 'Link';
  return Link;
});

jest.mock('next/image', () => {
  const Image = ({ src, alt, ...props }) => <img src={src} alt={alt} />;
  Image.displayName = 'Image';
  return Image;
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
  usePathname: () => '/',
}));

// ── Mock AuthContext ─────────────────────────────────────────────────────────
const mockUser = {
  _id: 'user1',
  username: 'testdev',
  email: 'test@dev.com',
  avatar: '',
  bio: 'Developer',
};

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

jest.mock('@/lib/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
    updateProfile: jest.fn(),
  },
  postsAPI: {
    getAll: jest.fn().mockResolvedValue({ posts: [], total: 0, pages: 1, page: 1 }),
    getOne: jest.fn(),
    like: jest.fn(),
  },
  tagsAPI: { getAll: jest.fn().mockResolvedValue([]) },
  commentsAPI: { getByPost: jest.fn().mockResolvedValue([]) },
}));

// ────────────────────────────────────────────────────────────────────────────

const mockPost = {
  _id: 'post1',
  title: 'How to Build a MERN Stack App',
  slug: 'how-to-build-mern-stack',
  excerpt: 'A comprehensive guide to building full-stack apps with MongoDB, Express, React, and Node.',
  content: 'Full content here...',
  coverImage: '',
  author: { _id: 'user1', username: 'testdev', avatar: '' },
  tags: [
    { _id: 'tag1', name: 'React', slug: 'react', color: '#61dafb' },
    { _id: 'tag2', name: 'Node.js', slug: 'nodejs', color: '#68a063' },
  ],
  likes: [],
  views: 42,
  readingTime: 5,
  published: true,
  createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
};

// ── PostCard tests ────────────────────────────────────────────────────────────
describe('PostCard component', () => {
  const PostCard = require('@/components/posts/PostCard').default;

  test('1. Renders post title', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('How to Build a MERN Stack App')).toBeInTheDocument();
  });

  test('2. Renders author username', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('testdev')).toBeInTheDocument();
  });

  test('3. Renders tags', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  test('4. Title links to post slug', () => {
    render(<PostCard post={mockPost} />);
    const link = screen.getByRole('link', { name: 'How to Build a MERN Stack App' });
    expect(link).toHaveAttribute('href', '/posts/how-to-build-mern-stack');
  });

  test('5. Renders reading time', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText(/5m/)).toBeInTheDocument();
  });

  test('6. Renders excerpt', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText(/comprehensive guide/)).toBeInTheDocument();
  });
});

// ── LoginForm tests ───────────────────────────────────────────────────────────
describe('LoginForm component', () => {
  const LoginForm = require('@/components/auth/LoginForm').default;

  test('7. Renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('8. Renders sign in button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('9. Shows validation — HTML5 required prevents empty submit', () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeRequired();
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeRequired();
  });

  test('10. Renders link to register page', () => {
    render(<LoginForm />);
    const link = screen.getByRole('link', { name: /create one/i });
    expect(link).toHaveAttribute('href', '/register');
  });
});
