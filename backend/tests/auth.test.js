const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); // Make sure to export app from server.js
const User = require('../models/User');
const logger = require('../utils/logger');

let mongoServer;

beforeAll(async () => {
  // Disconnect from any existing connection first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Clear the database between tests
  await User.deleteMany({});
});

describe('Authentication Tests', () => {
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123456',
          role: 'user'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      
      logger.info('User registration successful', { userId: res.body.data?._id });
    });

    it('should not register user with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123456'
        });

      // Second registration with same email
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User 2',
          email: 'test@example.com',
          password: '123456'
        });

      expect(res.statusCode).toBe(400);
      logger.warn('Duplicate registration attempt', { email: 'test@example.com' });
    });
  });

  describe('User Login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create user first
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123456'
        });

      // Try to login
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: '123456'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      logger.info('User login successful', { email: 'test@example.com' });
    });
  });

  describe('Protected Routes', () => {
    let token;
    let adminToken;

    beforeEach(async () => {
      // Create a regular user
      const userRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'user@example.com',
          password: '123456',
          role: 'user'
        });
      token = userRes.body.token;

      // Create an admin user
      const adminRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Admin User',
          email: 'admin@example.com',
          password: '123456',
          role: 'admin'
        });
      adminToken = adminRes.body.token;
    });

    it('should access /api/v1/auth/me with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe('user@example.com');
      logger.info('Protected route accessed successfully');
    });

    it('should not access /api/v1/auth/me with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.statusCode).toBe(401);
      logger.warn('Invalid token access attempt');
    });

    it('should allow admin access to admin-only routes', async () => {
      const res = await request(app)
        .post('/api/v1/website-analysis/analyze')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          url: 'https://example.com'
        });

      expect(res.statusCode).toBe(201);
      logger.info('Admin access granted to protected route');
    });

    it('should deny user access to admin-only routes', async () => {
      const res = await request(app)
        .post('/api/v1/website-analysis/analyze')
        .set('Authorization', `Bearer ${token}`)
        .send({
          url: 'https://example.com'
        });

      expect(res.statusCode).toBe(403);
      logger.warn('User attempted to access admin-only route');
    });
  });
}); 