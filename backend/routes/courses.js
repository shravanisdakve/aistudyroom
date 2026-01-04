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

// ========== ENROLLMENT ENDPOINTS ==========

// GET all available courses (for student browsing/marketplace)
router.get('/available', async (req, res) => {
    try {
        const courses = await Course.find({}).select('name code description level duration userId students createdAt');
        const result = courses.map(c => ({
            id: c._id,
            name: c.name,
            code: c.code,
            description: c.description || '',
            level: c.level || 'General',
            duration: c.duration || 'Self-paced',
            teacherId: c.userId,
            studentsCount: c.students?.length || 0,
            createdAt: c.createdAt
        }));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST join a course by code
router.post('/join', async (req, res) => {
    try {
        const { code, studentId } = req.body;
        if (!code || !studentId) {
            return res.status(400).json({ error: 'Course code and student ID required' });
        }

        const course = await Course.findOne({ code: code.toUpperCase() });
        if (!course) {
            return res.status(404).json({ error: 'Course not found. Check the code and try again.' });
        }

        // Check if already enrolled
        if (course.students && course.students.includes(studentId)) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        // Add student to course
        course.students = course.students || [];
        course.students.push(studentId);
        await course.save();

        res.json({
            message: 'Successfully enrolled!',
            course: {
                id: course._id,
                name: course.name,
                code: course.code
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET enrolled courses for a student
router.get('/enrolled/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const courses = await Course.find({ students: studentId });

        const result = courses.map(c => ({
            id: c._id,
            name: c.name,
            code: c.code,
            description: c.description || '',
            level: c.level || 'General',
            duration: c.duration || 'Self-paced',
            teacherId: c.userId,
            color: c.color || '#8b5cf6'
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
