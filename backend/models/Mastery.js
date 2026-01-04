const mongoose = require('mongoose');

const MasterySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    topic: { type: String, required: true },
    score: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mastery', MasterySchema);
