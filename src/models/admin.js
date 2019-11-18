const mongoose = require('mongoose');

const Admin_schema = mongoose.Schema({
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
  role: {
    type: String,
    default: 'admin'
  }
});

const Admin = mongoose.model('Admin', Admin_schema);
module.exports = Admin;

mongoose.set('useCreateIndex', true);
