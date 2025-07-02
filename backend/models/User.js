/**
 * User model for authentication and user data
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: { type: String }, // Only for local provider
  provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
  name: { type: String },
  avatar: { type: String }, // base64 or URL
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema); 