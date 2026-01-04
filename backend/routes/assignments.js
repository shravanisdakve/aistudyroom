const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');

// CREATE Assignment (Teacher)
router.post('/create', async (req, res) => {
    try {
        const assignment = await Assignment.create(req.body);
        res.status(201).json(assignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Assignments for a specific Course
router.get('/course/:courseId', async (req, res) => {
    try {
        const assignments = await Assignment.find({ courseId: req.params.courseId }).sort({ dueAt: 1 });
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Pending/Active Assignments for a Student (By ID)
// This logic assumes the student is part of courses linked by that ID or just fetches all for now.
// For a real system, we'd filter by the student's enrolled courses.
// Implementation: Fetch all assignments where the student is in `assignedTo` OR (if assignedTo is empty) fetch for courses the student is in.
// SIMPLIFICATION: Fetch all assignments for courses the student is enrolled in (passed via query param or fetched from User profile).
router.get('/student/:studentId', async (req, res) => {
    try {
        // Warning: This implies we need to know student's courses. 
        // For MVP, letting frontend filter or passing courseIds could work.
        // Let's assume we return all assignments and frontend filters, or we improve this later.
        // Actually, let's just fetch all assignments for now to unblock.
        const assignments = await Assignment.find({}).sort({ dueAt: 1 });

        // Also fetch submissions to check status
        const submissions = await AssignmentSubmission.find({ studentId: req.params.studentId });

        const result = assignments.map(a => {
            const sub = submissions.find(s => s.assignmentId.toString() === a._id.toString());
            return {
                ...a.toObject(),
                status: sub ? sub.status : 'not_started',
                submission: sub || null
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Assignments for Teacher (By Teacher ID)
router.get('/teacher/:teacherId', async (req, res) => {
    try {
        const assignments = await Assignment.find({ teacherId: req.params.teacherId }).sort({ dueAt: 1 });

        // For each assignment, get submission counts
        const result = await Promise.all(assignments.map(async (a) => {
            const submissions = await AssignmentSubmission.find({ assignmentId: a._id });
            const submittedCount = submissions.length;
            const gradedCount = submissions.filter(s => s.status === 'graded').length;

            return {
                ...a.toObject(),
                submittedCount,
                gradedCount,
                totalStudents: a.assignedTo.length || 0 // approximate
            };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Single Assignment
router.get('/:id', async (req, res) => {
    if (req.params.id === 'student' || req.params.id === 'teacher') return; // conflict guard
    try {
        const assignment = await Assignment.findById(req.params.id);
        res.json(assignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET All Submissions for an Assignment (Teacher grading view)
router.get('/:id/submissions', async (req, res) => {
    try {
        const submissions = await AssignmentSubmission.find({ assignmentId: req.params.id });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// SUBMIT Assignment (Student)
router.post('/submit', async (req, res) => {
    try {
        const submission = await AssignmentSubmission.create(req.body);
        res.status(201).json(submission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GRADE Assignment (Teacher)
router.post('/grade', async (req, res) => {
    const { submissionId, grade, feedback } = req.body;
    try {
        const submission = await AssignmentSubmission.findByIdAndUpdate(
            submissionId,
            { grade, feedback, status: 'graded' },
            { new: true }
        );
        res.json(submission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
