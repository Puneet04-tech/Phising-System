/**
 * Utility script to create or promote a user to admin role
 * Usage: node src/scripts/createAdmin.js <email>
 * Example: node src/scripts/createAdmin.js admin@example.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address');
    console.log('Usage: node src/scripts/createAdmin.js <email>');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.error(`User with email ${email} not found`);
      console.log('Please sign up first, then run this script to promote the user to admin');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`User ${email} is already an admin`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully promoted ${email} to admin role`);
    console.log(`User ID: ${user._id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
