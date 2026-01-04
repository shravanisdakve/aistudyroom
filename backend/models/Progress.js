const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    goals: [{
        text: String,
        completed: Boolean
    }],
    challenges: [{
        id: String,
        title: String,
        completed: Boolean
    }]
});

module.exports = mongoose.model('Progress', ProgressSchema);
