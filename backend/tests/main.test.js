/**
 * DevBlog Test Suite — 10 meaningful test cases
 * Covers: model validation, utility functions, route handlers,
 *         API integration (Supertest), and auth middleware.
 */

const mongoose = require('mongoose');
const request = require('supertest');

// ─── Setup: in-memory-like test DB ──────────────────────────────────────────
beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/devblog_test'
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// ─── 1. Unit: User model validation ─────────────────────────────────────────
describe('Unit — User model validation', () => {
  const User = require('../models/User');

  test('1. Rejects user without required fields', async () => {
    const user = new User({});
    const err = user.validateSync();
    expect(err.errors.username).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  test('2. Rejects invalid email format', async () => {
    const user = new User({ username: 'test', email: 'not-an-email', password: 'secret123' });
    const err = user.validateSync();
    expect(err.errors.email).toBeDefined();
  });

  test('3. Accepts valid user data', async () => {
    const user = new User({
      username: 'validuser',
      email: 'valid@example.com',
      password: 'password123',
    });
    const err = user.validateSync();
    expect(err).toBeUndefined();
  });
});

// ─── 2. Unit: Utility function ───────────────────────────────────────────────
describe('Unit — generateSlug utility', () => {
  const { generateSlug } = require('../utils/helpers');

  test('4. Converts text to lowercase slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  test('5. Removes special characters', () => {
    expect(generateSlug('React & Next.js! Tips #2024')).toBe('react-nextjs-tips-2024');
  });

  test('6. Handles multiple spaces and dashes', () => {
    expect(generateSlug('  too   many   spaces  ')).toBe('too-many-spaces');
  });
});

// ─── 3. Unit: Auth middleware ────────────────────────────────────────────────
describe('Unit — Auth middleware (mocked)', () => {
  const { protect } = require('../middleware/auth');

  test('7. Returns 401 when no Authorization header', async () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized, no token' })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── 4. Integration: API endpoints (Supertest) ───────────────────────────────
describe('Integration — Auth API endpoints', () => {
  // Inline minimal app to avoid starting the real server
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use('/api/auth', require('../routes/auth'));

  const testUser = {
    username: `tester_${Date.now()}`,
    email: `tester_${Date.now()}@test.com`,
    password: 'testpass123',
  };
  let authToken;

  test('8. POST /api/auth/register — creates a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email);
    authToken = res.body.token;
  });

  test('9. POST /api/auth/login — returns token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('10. GET /api/auth/me — returns user data with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body).not.toHaveProperty('password');
  });
});
