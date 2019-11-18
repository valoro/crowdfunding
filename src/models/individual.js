const mongoose = require('mongoose');

const Individual_schema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  identityNumber: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pendingOTP', 'requested', 'activated', 'deactivated'],
    default: 'pendingOTP'
  },
  oneTimePasswordSid: {
    type: String,
    required: false
  },
  oneTimePasswordCreatedAt: {
    type: Date,
    required: false
  },
  oneTimePasswordExpiresAt: {
    type: Date,
    required: false
  },
  role: {
    type: String,
    default: 'individual'
  }
});

const Individual = mongoose.model('Individual', Individual_schema);
module.exports = Individual;

mongoose.set('useCreateIndex', true);
