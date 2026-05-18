/**
 * DevBlog Test Suite — 10 meaningful test cases
 */

require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'devblog_test_secret_key';

const mongoose = require('mongoose');
const request = require('supertest');

// Register ALL models before tests — prevents "Schema hasn't been registered" errors
require('../models/User');
require('../models/Post');
require('../models/Comment');
require('../models/Tag');

const ATLAS_URI = process.env.MONGODB_URI ||
  'mongodb+srv://aibekkemel_db_user:bVvfV4nyT70ePNPF@devblog.alidcsg.mongodb.net/devblog_test?appName=devblog';

// Shared express app — created ONCE for all tests
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/auth', require('../routes/auth'));

beforeAll(async () => {
  await mongoose.connect(ATLAS_URI, { serverSelectionTimeoutMS: 15000 });
}, 20000);

afterAll(async () => {
  try {
    await mongoose.connection.collection('users').deleteMany({ email: /@test\.com$/ });
  } catch {}
  await mongoose.connection.close();
}, 10000);

// ─── 1-3. UNIT: User model validation ────────────────────────────────────────
describe('Unit — User model validation', () => {
  const User = require('../models/User');

  test('1. Rejects user without required fields', () => {
    const user = new User({});
    const err = user.validateSync();
    expect(err.errors.username).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  test('2. Rejects invalid email format', () => {
    const user = new User({ username: 'test', email: 'not-an-email', password: 'secret123' });
    const err = user.validateSync();
    expect(err.errors.email).toBeDefined();
  });

  test('3. Accepts valid user data', () => {
    const user = new User({
      username: 'validuser',
      email: 'valid@example.com',
      password: 'password123',
    });
    expect(user.validateSync()).toBeUndefined();
  });
});

// ─── 4-6. UNIT: Utility functions ────────────────────────────────────────────
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

// ─── 7. UNIT: Auth middleware (mocked) ───────────────────────────────────────
describe('Unit — Auth middleware (mocked)', () => {
  const { protect } = require('../middleware/auth');

  test('7. Returns 401 when no Authorization header', async () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized, no token' })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── 8-10. INTEGRATION: Auth API via Supertest ───────────────────────────────
describe('Integration — Auth API endpoints', () => {
  const ts = Date.now();
  const testUser = {
    username: `tester_${ts}`,
    email: `tester_${ts}@test.com`,
    password: 'testpass123',
  };
  let authToken;

  test('8. POST /api/auth/register — creates a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email);
    authToken = res.body.token;
  }, 15000);

  test('9. POST /api/auth/login — returns token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    // Use the fresh login token for test 10
    authToken = res.body.token;
  }, 15000);

  test('10. GET /api/auth/me — returns user data with valid token', async () => {
    expect(authToken).toBeDefined();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    // Debug: show what came back if not 200
    if (res.status !== 200) {
      console.error('Test 10 failed body:', JSON.stringify(res.body));
    }
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body).not.toHaveProperty('password');
  }, 15000);
});