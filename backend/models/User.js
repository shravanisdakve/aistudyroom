const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
  },
  university: {
    type: String,
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    default: 'student'
  },
  primarySubject: {
    type: String,
  }
});

module.exports = mongoose.model("User", UserSchema);