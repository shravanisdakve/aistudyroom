# NexusAI - Development Guide

## Quick Start

### 1. Start Backend
```bash
cd d:\WORKHERE\aistudyroom\backend
npm start
```

### 2. Seed Database (REQUIRED for testing)
Open in browser or use Postman:
```
POST http://localhost:5000/api/seed
```

### 3. Start Frontend
```bash
cd d:\WORKHERE\aistudyroom
npm run dev
```

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Teacher** | teacher1@nexusai.com | Pass@123 |
| **Teacher** | teacher2@nexusai.com | Pass@123 |
| **Student** | student1@nexusai.com | Pass@123 |
| **Student** | student2@nexusai.com | Pass@123 |
| **Student** | student3@nexusai.com | Pass@123 |

---

## Core Learning Loop

✅ **Teacher creates course** → CreateCourse.tsx  
✅ **Teacher creates assignment** → CreateAssignment.tsx  
✅ **Student sees assignment** → Dashboard.tsx (Today's Tasks)  
✅ **Student submits** → AssignmentDetail.tsx  
✅ **Teacher grades** → AssignmentDetail.tsx (Teacher view)  
✅ **Student sees grade** → AssignmentDetail.tsx + Dashboard  

---

## API Endpoints

### Courses
- `GET /api/courses/teacher/:id` - Teacher's courses
- `GET /api/courses/student/:id` - Student's enrolled courses
- `POST /api/courses/join` - Join by code
- `GET /api/courses/available` - Browse all

### Assignments
- `POST /api/assignments/create` - Create assignment
- `GET /api/assignments/student/:id` - Student's assignments
- `GET /api/assignments/teacher/:id` - Teacher's assignments
- `POST /api/assignments/submit` - Submit work
- `POST /api/assignments/grade` - Grade submission

### Dashboard
- `GET /api/dashboard/student/:id` - Student dashboard data
- `GET /api/dashboard/teacher/:id` - Teacher dashboard data

### Seeding
- `POST /api/seed` - Populate database with dummy data
- `GET /api/seed/status` - Check if seeded
