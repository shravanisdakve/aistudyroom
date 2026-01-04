/**
 * NexusAI - Database Seed Script
 * Run with: npm run seed (or node seed.js)
 * 
 * Creates dummy data for testing:
 * - 2 Teachers
 * - 5 Students
 * - 4 Courses
 * - 6 Assignments per course
 * - Sample submissions with grades
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Course = require('./models/Course');
const Assignment = require('./models/Assignment');
const AssignmentSubmission = require('./models/AssignmentSubmission');
const Progress = require('./models/Progress');
const Mastery = require('./models/Mastery');

// Connect to MongoDB
const connectDB = require('./config/db');

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
    { name: 'Introduction to AI', code: 'CS101', section: 'A', term: 'Spring 2026', level: 'Beginner', duration: '12 Weeks', color: '#8b5cf6' },
    { name: 'Data Structures', code: 'CS201', section: 'B', term: 'Spring 2026', level: 'Intermediate', duration: '12 Weeks', color: '#06b6d4' },
    { name: 'Machine Learning', code: 'CS301', section: 'A', term: 'Spring 2026', level: 'Advanced', duration: '14 Weeks', color: '#f59e0b' },
    { name: 'Calculus II', code: 'MATH202', section: 'C', term: 'Spring 2026', level: 'Intermediate', duration: '12 Weeks', color: '#10b981' }
];

const ASSIGNMENT_TEMPLATES = [
    { title: 'Week 1 Quiz', type: 'quiz', points: 20, description: 'Test your understanding of the fundamental concepts covered in Week 1.' },
    { title: 'Homework 1: Basics', type: 'homework', points: 50, description: 'Complete all exercises from Chapter 1. Show your work clearly.' },
    { title: 'Lab Exercise 1', type: 'homework', points: 30, description: 'Hands-on coding exercise. Submit your code file and a brief report.' },
    { title: 'Midterm Project Proposal', type: 'project', points: 100, description: 'Submit a 2-page proposal for your midterm project including objectives, methodology, and timeline.' },
    { title: 'Week 3 Quiz', type: 'quiz', points: 25, description: 'Multiple choice quiz covering Weeks 2-3 material.' },
    { title: 'Final Project', type: 'project', points: 200, description: 'Complete implementation of your proposed project with documentation.' }
];

// ========== SEED FUNCTION ==========

async function seed() {
    console.log('🌱 Starting NexusAI Database Seeding...\n');

    try {
        await connectDB();
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data (optional - be careful in production!)
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Course.deleteMany({});
        await Assignment.deleteMany({});
        await AssignmentSubmission.deleteMany({});
        await Progress.deleteMany({});
        await Mastery.deleteMany({});
        console.log('✅ Cleared\n');

        // Create Teachers
        console.log('👨‍🏫 Creating teachers...');
        const createdTeachers = [];
        for (const t of TEACHERS) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(t.password, salt);
            const user = await User.create({ ...t, password: hashedPassword });
            createdTeachers.push(user);
            console.log(`   ✅ ${t.displayName} (${t.email})`);
        }

        // Create Students
        console.log('\n👩‍🎓 Creating students...');
        const createdStudents = [];
        for (const s of STUDENTS) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(s.password, salt);
            const user = await User.create({ ...s, password: hashedPassword });
            createdStudents.push(user);
            console.log(`   ✅ ${s.displayName} (${s.email})`);
        }

        // Create Courses
        console.log('\n📚 Creating courses...');
        const createdCourses = [];
        for (let i = 0; i < COURSES.length; i++) {
            const c = COURSES[i];
            const teacher = createdTeachers[i % createdTeachers.length];
            // Enroll random 2-4 students
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
            console.log(`   ✅ ${c.name} (${c.code}) - Teacher: ${teacher.displayName}, Students: ${enrolledStudents.length}`);
        }

        // Create Assignments
        console.log('\n📝 Creating assignments...');
        const createdAssignments = [];
        for (const course of createdCourses) {
            for (let i = 0; i < ASSIGNMENT_TEMPLATES.length; i++) {
                const template = ASSIGNMENT_TEMPLATES[i];
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + (i * 7) + 3); // Stagger due dates

                const assignment = await Assignment.create({
                    ...template,
                    courseId: course._id.toString(),
                    teacherId: course.userId,
                    dueAt: dueDate,
                    assignedTo: course.students
                });
                createdAssignments.push(assignment);
            }
            console.log(`   ✅ Created ${ASSIGNMENT_TEMPLATES.length} assignments for ${course.name}`);
        }

        // Create Sample Submissions
        console.log('\n📤 Creating sample submissions...');
        let submissionCount = 0;
        for (const assignment of createdAssignments.slice(0, 8)) { // First 8 assignments only
            // Random students submit
            const course = createdCourses.find(c => c._id.toString() === assignment.courseId);
            if (!course) continue;

            for (const studentId of course.students.slice(0, 2)) { // First 2 enrolled students submit
                const isGraded = Math.random() > 0.4;
                const score = isGraded ? Math.floor(Math.random() * (assignment.points * 0.4)) + (assignment.points * 0.6) : null;

                await AssignmentSubmission.create({
                    assignmentId: assignment._id,
                    studentId,
                    content: `This is my submission for ${assignment.title}. I have completed all the required tasks as outlined in the instructions.`,
                    status: isGraded ? 'graded' : 'submitted',
                    grade: score,
                    feedback: isGraded ? 'Good work! Keep improving.' : null,
                    submittedAt: new Date()
                });
                submissionCount++;
            }
        }
        console.log(`   ✅ Created ${submissionCount} submissions\n`);

        // Create Progress & Mastery records
        console.log('📊 Creating progress and mastery records...');
        for (const student of createdStudents) {
            for (const course of createdCourses) {
                if (course.students.includes(student._id.toString())) {
                    // Progress
                    await Progress.create({
                        userId: student._id.toString(),
                        courseId: course._id.toString(),
                        completedLessons: [1, 2],
                        lastAccessed: new Date()
                    });

                    // Mastery
                    await Mastery.create({
                        userId: student._id.toString(),
                        topic: course.name,
                        score: Math.floor(Math.random() * 40) + 50, // 50-90
                        confidence: 0.7 + Math.random() * 0.25
                    });
                }
            }
        }
        console.log('   ✅ Created progress and mastery records\n');

        // Summary
        console.log('═'.repeat(50));
        console.log('🎉 SEEDING COMPLETE!\n');
        console.log('📋 Test Accounts:');
        console.log('   TEACHER: teacher1@nexusai.com / Pass@123');
        console.log('   STUDENT: student1@nexusai.com / Pass@123');
        console.log('');
        console.log(`   Total: ${createdTeachers.length} teachers, ${createdStudents.length} students`);
        console.log(`          ${createdCourses.length} courses, ${createdAssignments.length} assignments`);
        console.log('═'.repeat(50));

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed.');
        process.exit(0);
    }
}

// Run
seed();
