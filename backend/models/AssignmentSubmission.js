const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'submitted', 'graded'], default: 'submitted' },
    content: { type: String }, // Text answer or description
    attachments: [{
        name: String,
        url: String
    }],
    grade: { type: Number },
    feedback: { type: String }
});

module.exports = mongoose.model('AssignmentSubmission', submissionSchema);
