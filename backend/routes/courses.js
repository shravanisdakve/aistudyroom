const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Get all courses for a user
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ msg: 'User ID required' });

        const courses = await Course.find({ userId });
        res.json(courses);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Add a new course
router.post('/', async (req, res) => {
    try {
        const { userId, name, color, description, level, duration, syllabus } = req.body;
        const newCourse = new Course({ userId, name, color, description, level, duration, syllabus });
        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Delete a course
router.delete('/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Course removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
