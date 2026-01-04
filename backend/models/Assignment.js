const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    courseId: { type: String, required: true }, // Logic course identifier (e.g., "CS101", "DBMS")
    teacherId: { type: String, required: true },
    dueAt: { type: Date, required: true },
    type: { type: String, enum: ['quiz', 'homework', 'project'], default: 'homework' },
    points: { type: Number, default: 100 },
    attachments: [{
        name: String,
        url: String,
        type: String // 'pdf', 'link', etc.
    }],
    // For targeting specific students (optional). If empty, implies entire course.
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
