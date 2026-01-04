const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');

// Get user progress
router.get('/:userId', async (req, res) => {
    try {
        let progress = await Progress.findOne({ userId: req.params.userId });
        if (!progress) {
            // Create default if not exists
            progress = new Progress({ userId: req.params.userId });
            await progress.save();
        }
        res.json(progress);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update progress (XP, Level)
router.post('/update', async (req, res) => {
    try {
        const { userId, xp, level } = req.body;
        let progress = await Progress.findOne({ userId });
        if (!progress) {
            progress = new Progress({ userId, xp, level });
        } else {
            progress.xp = xp;
            progress.level = level;
            progress.lastActiveDate = Date.now();
        }
        await progress.save();
        res.json(progress);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
