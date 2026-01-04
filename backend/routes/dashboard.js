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

        // 1. Fetch User
        const user = await User.findById(userId);

        // 2. Fetch ENROLLED Courses (where student is in 'students' array)
        const enrolledCourses = await Course.find({ students: userId });
        const courseIds = enrolledCourses.map(c => c._id.toString());

        // 3. Fetch Assignments for enrolled courses
        const assignments = await Assignment.find({ courseId: { $in: courseIds } }).sort({ dueAt: 1 });

        // 4. Fetch Submissions by this student
        let submissions = [];
        try {
            submissions = await AssignmentSubmission.find({ studentId: userId });
        } catch (e) { console.warn("Submission fetch error", e); }

        // 5. Calculate Stats
        const completedCount = submissions.filter(s => s.status === 'graded' || s.status === 'submitted').length;
        const gradedSubmissions = submissions.filter(s => s.status === 'graded' && s.grade !== null);

        // Average score calculation
        let avgScore = 0;
        if (gradedSubmissions.length > 0) {
            const totalPossible = gradedSubmissions.reduce((acc, s) => {
                const assignment = assignments.find(a => a._id.toString() === s.assignmentId.toString());
                return acc + (assignment?.points || 100);
            }, 0);
            const totalEarned = gradedSubmissions.reduce((acc, s) => acc + (s.grade || 0), 0);
            avgScore = Math.round((totalEarned / totalPossible) * 100);
        }

        // 6. Process "Today's Tasks" (Due soon, not completed)
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const tasks = assignments.map(a => {
            const sub = submissions.find(s => s.assignmentId?.toString() === a._id.toString());
            const course = enrolledCourses.find(c => c._id.toString() === a.courseId);
            return {
                id: a._id,
                title: a.title,
                type: a.type,
                course: course?.name || 'Course',
                courseColor: course?.color || '#8b5cf6',
                dueAt: a.dueAt,
                points: a.points,
                isUrgent: new Date(a.dueAt) < new Date(now.getTime() + 48 * 60 * 60 * 1000),
                status: sub ? sub.status : 'pending',
                grade: sub?.grade || null
            };
        }).filter(t => t.status !== 'graded' && new Date(t.dueAt) > now).slice(0, 6);

        // 7. Graded results (recently graded)
        const recentGraded = assignments.map(a => {
            const sub = submissions.find(s => s.assignmentId?.toString() === a._id.toString() && s.status === 'graded');
            if (!sub) return null;
            return {
                id: a._id,
                title: a.title,
                grade: sub.grade,
                points: a.points,
                feedback: sub.feedback
            };
        }).filter(Boolean).slice(0, 3);

        // 8. Courses list for sidebar
        const coursesList = enrolledCourses.map(c => ({
            id: c._id,
            name: c.name,
            code: c.code,
            color: c.color,
            level: c.level
        }));

        // 9. Assemble Response
        res.json({
            greeting: user?.displayName ? `Welcome back, ${user.displayName.split(' ')[0]}` : "Welcome back",
            stats: {
                streak: 5, // TODO: Calculate from Progress
                mastery: avgScore,
                tasksCount: tasks.length,
                completedCount
            },
            courses: coursesList,
            today: tasks,
            recentGraded,
            schedule: [
                { time: "10:00 AM", course: enrolledCourses[0]?.name || "Class", type: "Lecture" },
                { time: "02:00 PM", course: enrolledCourses[1]?.name || "Lab", type: "Lab" }
            ],
            insight: {
                title: "Keep it up!",
                message: completedCount > 0
                    ? `You've completed ${completedCount} assignment${completedCount > 1 ? 's' : ''}. ${avgScore > 70 ? 'Great work!' : 'Keep pushing!'}`
                    : "Start your first assignment to build momentum!"
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

        // 1. Fetch User
        const user = await User.findById(userId);

        // 2. Fetch Courses Taught
        const courses = await Course.find({ userId });

        // 3. Fetch Assignments Created
        const assignments = await Assignment.find({ teacherId: userId }).sort({ dueAt: 1 });
        const assignmentIds = assignments.map(a => a._id);

        // 4. Fetch All Submissions for these assignments
        const allSubmissions = await AssignmentSubmission.find({ assignmentId: { $in: assignmentIds } });

        // 5. Calculate Stats
        const now = new Date();
        const gradingQueueCount = allSubmissions.filter(s => s.status === 'submitted').length;
        const activeAssignmentsCount = assignments.filter(a => new Date(a.dueAt) > now).length;
        const totalStudents = [...new Set(courses.flatMap(c => c.students || []))].length;

        // 6. Course List with average scores
        const courseList = courses.map(c => {
            // Get assignments for this course
            const courseAssignments = assignments.filter(a => a.courseId === c._id.toString());
            const courseAssignmentIds = courseAssignments.map(a => a._id.toString());

            // Get graded submissions for this course
            const courseSubmissions = allSubmissions.filter(s =>
                courseAssignmentIds.includes(s.assignmentId.toString()) &&
                s.status === 'graded' &&
                s.grade !== null
            );

            // Calculate average score
            let avgScore = null;
            if (courseSubmissions.length > 0) {
                const totalEarned = courseSubmissions.reduce((acc, s) => acc + (s.grade || 0), 0);
                const totalPossible = courseSubmissions.reduce((acc, s) => {
                    const assignment = courseAssignments.find(a => a._id.toString() === s.assignmentId.toString());
                    return acc + (assignment?.points || 100);
                }, 0);
                avgScore = Math.round((totalEarned / totalPossible) * 100);
            }

            return {
                id: c._id,
                name: c.name,
                code: c.code || 'N/A',
                color: c.color,
                section: c.section || 'A',
                term: c.term || 'Spring 2026',
                studentsCount: c.students?.length || 0,
                avgScore
            };
        });

        // 7. Assignment List with submission stats
        const assignmentList = assignments.map(a => {
            const subs = allSubmissions.filter(s => s.assignmentId.toString() === a._id.toString());
            const course = courses.find(c => c._id.toString() === a.courseId);
            const totalStudentsForAssignment = course?.students?.length || 0;

            return {
                id: a._id,
                title: a.title,
                courseName: course?.name || 'Unknown',
                courseColor: course?.color || '#8b5cf6',
                dueAt: a.dueAt,
                points: a.points,
                type: a.type,
                status: new Date(a.dueAt) > now ? 'Active' : 'Closed',
                submittedCount: subs.length,
                gradedCount: subs.filter(s => s.status === 'graded').length,
                ungradedCount: subs.filter(s => s.status === 'submitted').length,
                totalStudents: totalStudentsForAssignment
            };
        }).slice(0, 10); // Recent 10

        // 8. At-Risk Students (based on low scores or missing submissions)
        // For now, identify students with avg < 60% or missing multiple assignments
        const studentScores = {};
        allSubmissions.forEach(sub => {
            if (sub.status === 'graded' && sub.grade !== null) {
                const assignment = assignments.find(a => a._id.toString() === sub.assignmentId.toString());
                if (!studentScores[sub.studentId]) {
                    studentScores[sub.studentId] = { earned: 0, possible: 0 };
                }
                studentScores[sub.studentId].earned += sub.grade;
                studentScores[sub.studentId].possible += assignment?.points || 100;
            }
        });

        const studentsAtRisk = Object.entries(studentScores)
            .filter(([id, scores]) => (scores.earned / scores.possible) < 0.6)
            .map(([studentId, scores]) => ({
                id: studentId,
                name: studentId.substring(0, 8) + '...', // Would need to lookup user
                avgScore: Math.round((scores.earned / scores.possible) * 100),
                issue: 'Low Average Score',
                action: 'Send encouragement'
            })).slice(0, 5);

        // 9. Assemble Response
        res.json({
            greeting: user?.displayName ? `Welcome back, ${user.displayName.split(' ')[0]}` : "Welcome back, Professor",
            overview: {
                todayClassesCount: courses.length,
                nextClass: courses.length > 0 ? { id: courses[0]._id, name: courses[0].name, time: "10:00 AM" } : null,
                activeAssignmentsCount,
                gradingQueueCount,
                totalStudents,
                studentsAtRiskCount: studentsAtRisk.length
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
