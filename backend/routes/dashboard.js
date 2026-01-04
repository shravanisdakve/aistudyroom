const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Mastery = require('../models/Mastery');
const Progress = require('../models/Progress');

// GET /api/dashboard/student/:userId
router.get('/student/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Fetch User (Skipped - relying on userId param as ref)
        // const user = await User.findOne(...) 

        // 2. Fetch Enrolled Courses
        // Find courses where student is in 'students' array
        const courses = await Course.find({});

        // 3. Fetch Assignments
        const assignments = await Assignment.find({}).sort({ dueAt: 1 });

        // 4. Fetch Submissions status
        // Wrap in try-catch in case of schema casting issues on old data
        let submissions = [];
        try {
            submissions = await AssignmentSubmission.find({ studentId: userId });
        } catch (e) { console.warn("Submission fetch error", e); }

        // 5. Process "Today's Tasks" (Due within 48 hours, not done)
        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        const tasks = assignments.map(a => {
            const sub = submissions.find(s => s.assignmentId.toString() === a._id.toString());
            return {
                id: a._id,
                title: a.title,
                type: a.type,
                course: courses.find(c => c.id === a.courseId)?.name || 'General',
                dueAt: a.dueAt,
                isUrgent: new Date(a.dueAt) < twoDaysFromNow,
                status: sub ? sub.status : 'pending'
            };
        }).filter(t => t.status !== 'submitted' && t.status !== 'graded').slice(0, 5);

        // 6. Fetch Progress/Mastery
        const masteryRecords = await Mastery.find({ userId });
        const avgMastery = masteryRecords.length > 0
            ? Math.round(masteryRecords.reduce((acc, m) => acc + m.score, 0) / masteryRecords.length)
            : 0;

        // 7. Assemble Response
        res.json({
            greeting: "Welcome back",
            stats: {
                streak: 5, // Mock for now or fetch from Progress
                mastery: avgMastery,
                tasksCount: tasks.length
            },
            today: tasks,
            schedule: [
                { time: "10:00 AM", course: "Advanced Calculus", type: "Lecture" },
                { time: "02:00 PM", course: "Physics Lab", type: "Lab" }
            ], // Mock schedule
            insight: {
                title: "Keep it up!",
                message: "You've completed 3 assignments this week. Great momentum."
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dashboard/teacher/:userId
router.get('/teacher/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Fetch Courses Taught
        const courses = await Course.find({ userId });
        const courseIds = courses.map(c => c._id.toString());
        // Also support courseId stored as string

        // 2. Fetch Assignments Created
        // Filter by courseId instead of teacherId to avoid ObjectId casting issues if teacherId is messy
        // But since we updated Schema to String, teacherId query should work now.
        const assignments = await Assignment.find({ teacherId: userId }).sort({ dueAt: 1 });
        const assignmentsIdList = assignments.map(a => a._id);

        // 3. Fetch Submissions
        const allSubmissions = await AssignmentSubmission.find({ assignmentId: { $in: assignmentsIdList } });

        // 4. Calculate Stats & Lists
        const now = new Date();

        // Band 1 Data: Overview
        const todayClasses = courses.map(c => ({
            id: c._id,
            name: c.name,
            time: "10:00 AM", // Mock time
            topic: "Lecture" // Mock topic
        })).slice(0, 3); // Just taking first 3 as "Today's" for mock

        const nextClass = todayClasses.length > 0 ? todayClasses[0] : null;

        // Grading Queue
        const gradingQueueCount = assignments.reduce((acc, a) => {
            const subs = allSubmissions.filter(s => s.assignmentId.toString() === a._id.toString());
            const needsGrading = subs.filter(s => s.status === 'submitted').length;
            return acc + needsGrading;
        }, 0);

        const activeAssignmentsCount = assignments.filter(a => new Date(a.dueAt) > now).length;

        // Band 2 Data: Courses & Assignments
        const courseList = courses.map(c => ({
            id: c._id,
            name: c.name,
            code: c.code || 'N/A',
            studentsCount: c.students ? c.students.length : 0,
            section: "Fall 2025" // Mock
        }));

        const assignmentList = assignments.map(a => {
            const subs = allSubmissions.filter(s => s.assignmentId.toString() === a._id.toString());
            return {
                id: a._id,
                title: a.title,
                courseName: courses.find(c => c._id.toString() === a.courseId)?.name || 'Unknown',
                dueAt: a.dueAt,
                status: new Date(a.dueAt) > now ? 'Active' : 'Closed',
                submittedCount: subs.length,
                totalStudents: 25, // Mock total for now
                ungradedCount: subs.filter(s => s.status === 'submitted').length
            };
        });

        // Band 3 Data: At Risk (Mock logic)
        const studentsAtRisk = [
            { id: 's1', name: "Alex Johnson", course: "Intro to AI", issue: "Low Quiz Scores", action: "Assign practice" },
            { id: 's2', name: "Maria Garcia", course: "Data Structures", issue: "Missed 2 Assignments", action: "Send message" }
        ];

        // Assemble Response
        res.json({
            greeting: "Welcome back, Professor",
            overview: {
                todayClassesCount: todayClasses.length,
                nextClass,
                activeAssignmentsCount,
                gradingQueueCount,
                studentsAtRiskCount: studentsAtRisk.length,
                announcementsCount: 2
            },
            courses: courseList,
            assignments: assignmentList,
            studentsAtRisk
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
