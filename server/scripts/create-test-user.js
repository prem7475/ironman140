const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas!');
    console.log('Active Database:', mongoose.connection.name);

    const users = await User.find().select('name email role membershipStatus createdAt');
    console.log('\n--- LIST OF ALL USERS IN MONGODB ATLAS (`paceforge.users`) ---');
    users.forEach((u, index) => {
      console.log(`${index + 1}. Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Status: ${u.membershipStatus}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    mongoose.disconnect();
  }
};

run();
