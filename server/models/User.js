const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  countryCode: { type: String, default: '+91' },
  address: { type: String },
  nationality: { type: String },
  aadhaar: { type: String },
  docType: { type: String },
  membershipStatus: { type: String, enum: ['FREE', 'ACTIVE'], default: 'FREE' },
  membershipPrice: { type: Number, default: 4999 },
  walletBalance: { type: Number, default: 0, min: 0 },
  walletTransactions: [{
    type: { type: String, enum: ['CREDIT', 'DEBIT'] },
    amount: { type: Number, min: 0 },
    source: { type: String },
    reference: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  tokens: [{
    token: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  city: { type: String },
  healthDetails: {
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    bmi: { type: Number },
    bmiCategory: { type: String },
    vo2Max: { type: Number },
    vo2MaxUpdatedAt: { type: Date },
    vo2MaxHistory: [{ value: Number, date: Date }],
    age: { type: Number },
    gender: { type: String }
  },
  registeredEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
