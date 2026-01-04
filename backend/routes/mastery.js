const express = require('express');
const router = express.Router();
const Mastery = require('../models/Mastery');

// Get mastery for a user
router.get('/:userId', async (req, res) => {
    try {
        const mastery = await Mastery.find({ userId: req.params.userId });
        res.json(mastery);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update particular topic mastery
router.post('/update', async (req, res) => {
    try {
        const { userId, topic, scoreDelta } = req.body;

        let record = await Mastery.findOne({ userId, topic });
        if (!record) {
            record = new Mastery({ userId, topic, score: 50, confidence: 0.5 }); // Default start
        }

        // Simple update logic (clamp between 0 and 100)
        record.score = Math.max(0, Math.min(100, record.score + scoreDelta));
        record.lastUpdated = Date.now();

        await record.save();
        res.json(record);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
