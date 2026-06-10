const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function conflict(message) {
  const err = new Error(message);
  err.statusCode = 409;
  return err;
}

async function signup(req, res, next) {
  try {
    let body = req.body;

    // Some Windows shell/curl setups may send JSON as a string.
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        throw badRequest('Invalid JSON body');
      }
    }

    if (!body || typeof body !== 'object') {
      throw badRequest('Invalid JSON body');
    }

    const { name, email, password } = body;

    if (!name || typeof name !== 'string') throw badRequest('Name is required');
    if (!email || typeof email !== 'string') throw badRequest('Email is required');
    if (!password || typeof password !== 'string') throw badRequest('Password is required');

    if (password.length < 6) throw badRequest('Password must be at least 6 characters');

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) throw conflict('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
    });

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    let body = req.body;

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        throw badRequest('Invalid JSON body');
      }
    }

    if (!body || typeof body !== 'object') {
      throw badRequest('Invalid JSON body');
    }

    const { email, password } = body;

    if (!email || typeof email !== 'string') throw badRequest('Email is required');
    if (!password || typeof password !== 'string') throw badRequest('Password is required');

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw conflict('Invalid email or password');

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) throw conflict('Invalid email or password');

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };
