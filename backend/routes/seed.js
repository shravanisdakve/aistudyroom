/**
 * NexusAI - Seed Routes
 * Call POST /api/seed to populate the database with dummy data
 * This uses the existing MongoDB connection from the running server
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Progress = require('../models/Progress');
const Mastery = require('../models/Mastery');

// ========== DUMMY DATA ==========

const TEACHERS = [
    { email: 'teacher1@nexusai.com', password: 'Pass@123', displayName: 'Dr. Sarah Chen', university: 'MIT', role: 'teacher', primarySubject: 'Computer Science' },
    { email: 'teacher2@nexusai.com', password: 'Pass@123', displayName: 'Prof. James Wilson', university: 'Stanford', role: 'teacher', primarySubject: 'Mathematics' }
];

const STUDENTS = [
    { email: 'student1@nexusai.com', password: 'Pass@123', displayName: 'Alex Johnson', university: 'MIT', role: 'student' },
    { email: 'student2@nexusai.com', password: 'Pass@123', displayName: 'Maria Garcia', university: 'MIT', role: 'student' },
    { email: 'student3@nexusai.com', password: 'Pass@123', displayName: 'David Lee', university: 'Stanford', role: 'student' },
    { email: 'student4@nexusai.com', password: 'Pass@123', displayName: 'Emma Brown', university: 'MIT', role: 'student' },
    { email: 'student5@nexusai.com', password: 'Pass@123', displayName: 'Ryan Patel', university: 'Stanford', role: 'student' }
];

const COURSES = [
    { name: 'Introduction to AI', code: 'CS101', section: 'A', term: 'Spring 2026', level: 'Beginner', duration: '12 Weeks', color: '#8b5cf6', description: 'Learn the fundamentals of Artificial Intelligence including machine learning basics, neural networks, and practical applications.' },
    { name: 'Data Structures', code: 'CS201', section: 'B', term: 'Spring 2026', level: 'Intermediate', duration: '12 Weeks', color: '#06b6d4', description: 'Master essential data structures including arrays, linked lists, trees, graphs, and their algorithmic applications.' },
    { name: 'Machine Learning', code: 'CS301', section: 'A', term: 'Spring 2026', level: 'Advanced', duration: '14 Weeks', color: '#f59e0b', description: 'Advanced machine learning concepts including deep learning, reinforcement learning, and model optimization.' },
    { name: 'Calculus II', code: 'MATH202', section: 'C', term: 'Spring 2026', level: 'Intermediate', duration: '12 Weeks', color: '#10b981', description: 'Continuation of Calculus I covering integration techniques, sequences, series, and multivariable calculus.' }
];

const ASSIGNMENT_TEMPLATES = [
    { title: 'Week 1 Quiz', type: 'quiz', points: 20, description: 'Test your understanding of the fundamental concepts covered in Week 1. Multiple choice and short answer.' },
    { title: 'Homework 1: Basics', type: 'homework', points: 50, description: 'Complete all exercises from Chapter 1. Show your work clearly and submit as PDF.' },
    { title: 'Lab Exercise 1', type: 'homework', points: 30, description: 'Hands-on coding exercise. Submit your code file and a brief report explaining your approach.' },
    { title: 'Midterm Project Proposal', type: 'project', points: 100, description: 'Submit a 2-page proposal for your midterm project including objectives, methodology, and timeline.' },
    { title: 'Week 3 Quiz', type: 'quiz', points: 25, description: 'Multiple choice quiz covering Weeks 2-3 material. Open book, 30 minutes.' },
    { title: 'Final Project', type: 'project', points: 200, description: 'Complete implementation of your proposed project with documentation and presentation.' }
];

// POST /api/seed - Seed the entire database
router.post('/', async (req, res) => {
    try {
        console.log('🌱 Starting database seeding...');
        const results = { teachers: 0, students: 0, courses: 0, assignments: 0, submissions: 0 };

        // Clear existing data (optional - controlled by query param)
        if (req.query.clear === 'true') {
            console.log('🗑️ Clearing existing data...');
            await User.deleteMany({});
            await Course.deleteMany({});
            await Assignment.deleteMany({});
            await AssignmentSubmission.deleteMany({});
            await Progress.deleteMany({});
            await Mastery.deleteMany({});
        }

        // Create Teachers
        console.log('👨‍🏫 Creating teachers...');
        const createdTeachers = [];
        for (const t of TEACHERS) {
            const existing = await User.findOne({ email: t.email });
            if (!existing) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(t.password, salt);
                const user = await User.create({ ...t, password: hashedPassword });
                createdTeachers.push(user);
                results.teachers++;
            } else {
                createdTeachers.push(existing);
            }
        }

        // Create Students
        console.log('👩‍🎓 Creating students...');
        const createdStudents = [];
        for (const s of STUDENTS) {
            const existing = await User.findOne({ email: s.email });
            if (!existing) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(s.password, salt);
                const user = await User.create({ ...s, password: hashedPassword });
                createdStudents.push(user);
                results.students++;
            } else {
                createdStudents.push(existing);
            }
        }

        // Create Courses
        console.log('📚 Creating courses...');
        const createdCourses = [];
        for (let i = 0; i < COURSES.length; i++) {
            const c = COURSES[i];
            const existing = await Course.findOne({ code: c.code });
            if (!existing) {
                const teacher = createdTeachers[i % createdTeachers.length];
                const enrolledStudents = createdStudents
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 2 + Math.floor(Math.random() * 3))
                    .map(s => s._id.toString());

                const course = await Course.create({
                    ...c,
                    userId: teacher._id.toString(),
                    students: enrolledStudents,
                    syllabus: [
                        { week: 1, topic: 'Introduction & Fundamentals', content: 'Overview of the course, basic concepts, and first exercises.' },
                        { week: 2, topic: 'Core Concepts', content: 'Deep dive into the main theoretical framework.' },
                        { week: 3, topic: 'Practical Applications', content: 'Applying concepts to real-world scenarios.' },
                        { week: 4, topic: 'Review & Assessment', content: 'Midterm preparation and review sessions.' }
                    ]
                });
                createdCourses.push(course);
                results.courses++;
            } else {
                createdCourses.push(existing);
            }
        }

        // Create Assignments
        console.log('📝 Creating assignments...');
        for (const course of createdCourses) {
            const existingCount = await Assignment.countDocuments({ courseId: course._id.toString() });
            if (existingCount === 0) {
                for (let i = 0; i < ASSIGNMENT_TEMPLATES.length; i++) {
                    const template = ASSIGNMENT_TEMPLATES[i];
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + (i * 7) + 3);

                    await Assignment.create({
                        ...template,
                        courseId: course._id.toString(),
                        teacherId: course.userId,
                        dueAt: dueDate,
                        assignedTo: course.students
                    });
                    results.assignments++;
                }
            }
        }

        // Create Sample Submissions
        console.log('📤 Creating submissions...');
        const allAssignments = await Assignment.find({}).limit(8);
        for (const assignment of allAssignments) {
            const course = createdCourses.find(c => c._id.toString() === assignment.courseId);
            if (!course || !course.students) continue;

            for (const studentId of course.students.slice(0, 2)) {
                const existing = await AssignmentSubmission.findOne({ assignmentId: assignment._id, studentId });
                if (!existing) {
                    const isGraded = Math.random() > 0.4;
                    const score = isGraded ? Math.floor(Math.random() * (assignment.points * 0.4)) + (assignment.points * 0.6) : null;

                    await AssignmentSubmission.create({
                        assignmentId: assignment._id,
                        studentId,
                        content: `This is my submission for ${assignment.title}. I have completed all the required tasks.`,
                        status: isGraded ? 'graded' : 'submitted',
                        grade: score,
                        feedback: isGraded ? 'Good work! Keep improving.' : null,
                        submittedAt: new Date()
                    });
                    results.submissions++;
                }
            }
        }

        // Create Progress & Mastery
        console.log('📊 Creating progress/mastery...');
        for (const student of createdStudents) {
            for (const course of createdCourses) {
                if (course.students && course.students.includes(student._id.toString())) {
                    const existingProgress = await Progress.findOne({ userId: student._id.toString(), courseId: course._id.toString() });
                    if (!existingProgress) {
                        await Progress.create({
                            userId: student._id.toString(),
                            courseId: course._id.toString(),
                            completedLessons: [1, 2],
                            lastAccessed: new Date()
                        });
                    }

                    const existingMastery = await Mastery.findOne({ userId: student._id.toString(), topic: course.name });
                    if (!existingMastery) {
                        await Mastery.create({
                            userId: student._id.toString(),
                            topic: course.name,
                            score: Math.floor(Math.random() * 40) + 50,
                            confidence: 0.7 + Math.random() * 0.25
                        });
                    }
                }
            }
        }

        console.log('✅ Seeding complete!');
        res.json({
            success: true,
            message: 'Database seeded successfully!',
            results,
            testAccounts: {
                teacher: { email: 'teacher1@nexusai.com', password: 'Pass@123' },
                student: { email: 'student1@nexusai.com', password: 'Pass@123' }
            }
        });

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/seed/status - Check if seeded
router.get('/status', async (req, res) => {
    try {
        const users = await User.countDocuments({});
        const courses = await Course.countDocuments({});
        const assignments = await Assignment.countDocuments({});

        res.json({
            seeded: users > 0 && courses > 0,
            counts: { users, courses, assignments }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
