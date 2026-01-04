const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, default: '#8b5cf6' }, // Violet default
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);
