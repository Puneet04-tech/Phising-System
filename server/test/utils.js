const request = require('supertest');
const User = require('../src/models/User');

async function createUserAndToken(app, { name, email, password, role = 'user', jwtSecret }) {
  // Create user directly to speed up signup
  const bcrypt = require('bcryptjs');
  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
  });

  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    jwtSecret,
    { expiresIn: '1h' }
  );

  return { user, token };
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function signup(app, { name, email, password }) {
  return request(app).post('/api/auth/signup').send({ name, email, password });
}

async function login(app, { email, password }) {
  return request(app).post('/api/auth/login').send({ email, password });
}

module.exports = { createUserAndToken, authHeader, signup, login };
