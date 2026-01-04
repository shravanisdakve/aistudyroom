const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, default: '#8b5cf6' }, // Violet default
    description: { type: String },
    level: { type: String }, // e.g. "Beginner", "Grade 10"
    duration: { type: String }, // e.g. "4 Weeks"
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
