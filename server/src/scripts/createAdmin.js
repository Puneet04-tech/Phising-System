/**
 * Interactive script to create an admin account
 * Prompts for email, name, and password during execution
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const readline = require('readline');

const MONGODB_URI = process.env.MONGODB_URI;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('=== Create Admin Account ===\n');

    const email = await question('Enter admin email: ');
    const name = await question('Enter admin name: ');
    const password = await question('Enter admin password (min 6 characters): ');

    if (!email || !name || !password) {
      console.error('\n❌ All fields are required');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('\n❌ Password must be at least 6 characters');
      process.exit(1);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`\n⚠️  User ${email} is already an admin`);
        console.log(`   Name: ${existingUser.name}`);
        console.log(`   Role: ${existingUser.role}`);
        process.exit(0);
      }

      // Promote existing user to admin
      existingUser.role = 'admin';
      await existingUser.save();

      console.log(`\n✅ Successfully promoted existing user to admin`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`\n🔐 You can now login with these credentials:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: (your existing password)`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'admin',
      });

      console.log(`\n✅ Successfully created new admin account`);
      console.log(`   User ID: ${user._id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`\n🔐 Login credentials:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    }

    console.log('\n🎉 Admin setup complete! You can now access the admin dashboard.\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
