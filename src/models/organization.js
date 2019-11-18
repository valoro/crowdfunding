const mongoose = require('mongoose');

const Organization_schema = mongoose.Schema({
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
    organizationName: {
        type: String,
        required: true
    },
    organizationRegistrationNumber: {
        type: String,
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
    fileUpload: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'organization'
    }
});

const Organization = mongoose.model('Organization', Organization_schema);
module.exports = Organization;

mongoose.set('useCreateIndex', true);
