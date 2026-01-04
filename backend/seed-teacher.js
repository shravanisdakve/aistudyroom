require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Course = require("./models/Course");
const Assignment = require("./models/Assignment");

const seedTeacherData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Create teacher user with hashed password
        const hashedPassword = await bcrypt.hash("password123", 10);

        const teacher = await User.create({
            email: "teacher@test.com",
            password: hashedPassword,
            displayName: "Dr. Sarah Johnson",
            university: "MIT",
            role: "teacher",
            primarySubject: "Computer Science"
        });

        console.log("✅ Created teacher:", teacher.email);
        console.log("   Teacher ID:", teacher._id.toString());

        // Create sample courses
        const course1 = await Course.create({
            userId: teacher._id.toString(),
            name: "Introduction to AI",
            code: "CS401",
            description: "Foundations of artificial intelligence and machine learning",
            level: "Undergraduate",
            duration: "14 Weeks",
            students: [], // Add student UIDs here after creating student accounts
            syllabus: [
                { week: 1, topic: "Introduction to AI", content: "History and fundamentals of AI" },
                { week: 2, topic: "Search Algorithms", content: "BFS, DFS, A* algorithms" },
                { week: 3, topic: "Machine Learning Basics", content: "Supervised vs unsupervised learning" }
            ]
        });

        const course2 = await Course.create({
            userId: teacher._id.toString(),
            name: "Data Structures & Algorithms",
            code: "CS201",
            description: "Core data structures and algorithmic techniques",
            level: "Undergraduate",
            duration: "12 Weeks",
            students: [],
            syllabus: [
                { week: 1, topic: "Arrays and Lists", content: "Linear data structures" },
                { week: 2, topic: "Trees and Graphs", content: "Non-linear data structures" }
            ]
        });

        console.log("✅ Created courses:", course1.code, course2.code);

        // Create sample assignments
        const assignments = await Assignment.create([
            {
                title: "Homework 1: Binary Trees",
                description: "Implement BST insert, delete, and search operations",
                courseId: course2._id.toString(),
                teacherId: teacher._id.toString(),
                dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
                type: "homework",
                points: 100
            },
            {
                title: "Quiz 1: Neural Networks Basics",
                description: "Multiple choice quiz covering backpropagation and gradient descent",
                courseId: course1._id.toString(),
                teacherId: teacher._id.toString(),
                dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
                type: "quiz",
                points: 50
            },
            {
                title: "Midterm Project: AI Chatbot",
                description: "Build a simple chatbot using NLP techniques",
                courseId: course1._id.toString(),
                teacherId: teacher._id.toString(),
                dueAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Due in 3 weeks
                type: "project",
                points: 200
            },
            {
                title: "Assignment 2: Graph Algorithms",
                description: "Implement Dijkstra's and Kruskal's algorithms",
                courseId: course2._id.toString(),
                teacherId: teacher._id.toString(),
                dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Due in 2 weeks
                type: "homework",
                points: 150
            }
        ]);

        console.log("✅ Created", assignments.length, "assignments");

        console.log("\n" + "=".repeat(60));
        console.log("🎓 TEACHER DASHBOARD LOGIN CREDENTIALS");
        console.log("=".repeat(60));
        console.log("Email:      teacher@test.com");
        console.log("Password:   password123");
        console.log("Teacher ID:", teacher._id.toString());
        console.log("Courses:    2 (CS401, CS201)");
        console.log("Assignments:", assignments.length);
        console.log("=".repeat(60));
        console.log("\n✨ Teacher data seeded successfully!");
        console.log("   You can now log in as a teacher to test the Teacher Dashboard.\n");

        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");

    } catch (error) {
        console.error("❌ Error seeding teacher data:", error);
        process.exit(1);
    }
};

seedTeacherData();
