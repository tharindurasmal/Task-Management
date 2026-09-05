require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedAdmin() {
  const name = process.env.ADMIN_NAME || 'Admin';
  const email = (process.env.ADMIN_EMAIL || 'admin@rasmal.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '12345678';

  await mongoose.connect(process.env.connectionString);

  const existing = await User.findOne({ email });
  const hashed = await bcrypt.hash(password, 10);

  if (existing) {
    existing.role = 'admin';
    existing.password = hashed;
    existing.name = name;
    await existing.save();
    console.log(`Existing user ${email} updated to admin.`);
  } else {
    await User.create({ name, email, password: hashed, role: 'admin' });
    console.log(`Admin created: ${email}`);
  }

  console.log('--- Save these for your final submission ---');
  console.log(`Admin email:    ${email}`);
  console.log(`Admin password: ${password}`);

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});