const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Teacher ID
    name: { type: String, required: true },
    color: { type: String, default: '#8b5cf6' },
    description: { type: String },
    level: { type: String },
    duration: { type: String },
    section: { type: String, default: 'A' },
    term: { type: String, default: 'Spring 2026' },
    syllabus: [{
        week: Number,
        topic: String,
        content: String
    }],
    code: { type: String, unique: true, default: () => Math.random().toString(36).substring(2, 8).toUpperCase() },
    students: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);
