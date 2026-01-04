import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader, Card, Button, ScrollReveal } from '../components/ui';
import {
    Users, BookOpen, Calendar, Clock, AlertTriangle,
    CheckCircle, MessageSquare, Plus, ArrowRight, Sparkles,
    Megaphone, GraduationCap, Layout
} from 'lucide-react';
import { type TeacherDashboardData } from '../types'; // Import type from types
import { getTeacherDashboard } from '../services/teacherDashboardService'; // Import service from new file
import { generateFeedbackDraft, summarizeClassPerformance } from '../services/ai/geminiService';
import { format } from 'date-fns';

const TeacherDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<TeacherDashboardData | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'grading'>('active');
    const [aiLoading, setAiLoading] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (currentUser?.uid) {
                try {
                    const dashboardData = await getTeacherDashboard(currentUser.uid);
                    setData(dashboardData);
                } catch (error) {
                    console.error("Failed to fetch teacher dashboard data", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    const handleAiAction = async (action: 'feedback' | 'summary') => {
        setAiLoading(action);
        if (action === 'feedback') {
            const result = await generateFeedbackDraft("Recent Quiz", "Low Scores");
            alert("AI Drafted Feedback:\n\n" + result); // Simple alert for MVP
        } else if (action === 'summary') {
            const result = await summarizeClassPerformance("Midterm Exam", 72, 5);
            alert("AI Performance Summary:\n\n" + result);
        }
        setAiLoading(null);
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading Command Center...</div>;
    }

    if (!data) return null;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Teaching Command Center</h1>
                    <p className="text-slate-400 mt-1">See what is happening across your classes and where you are needed next.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-slate-300 border-slate-700" onClick={() => navigate('/create-course')}>
                        <BookOpen size={16} className="mr-2" /> New Course
                    </Button>
                    <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => navigate('/create-assignment')}>
                        <Plus size={16} className="mr-2" /> New Assignment
                    </Button>
                </div>
            </div>

            {/* BAND 1: TODAY'S OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Today's Classes */}
                <Card className="p-5 border-l-4 border-l-blue-500 bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <Calendar size={20} />
                        </div>
                        <span className="text-2xl font-bold text-white">{data.overview.todayClassesCount}</span>
                    </div>
                    <h3 className="font-semibold text-slate-200">Today's Classes</h3>
                    {data.overview.nextClass ? (
                        <p className="text-xs text-slate-400 mt-1">
                            Next: <span className="text-blue-300">{data.overview.nextClass.name}</span> at {data.overview.nextClass.time}
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 mt-1">No more classes today.</p>
                    )}
                </Card>

                {/* Card 2: Assignments Overview */}
                <Card className="p-5 border-l-4 border-l-purple-500 bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                            <CheckCircle size={20} />
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-white block">{data.overview.activeAssignmentsCount}</span>
                        </div>
                    </div>
                    <h3 className="font-semibold text-slate-200">Active Assignments</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        <span className="font-bold text-orange-400">{data.overview.gradingQueueCount}</span> submissions to grade
                    </p>
                </Card>

                {/* Card 3: Attention Needed (AI) */}
                <Card className="p-5 border-l-4 border-l-red-500 bg-slate-800/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <AlertTriangle size={64} />
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                            <Users size={20} />
                        </div>
                        <span className="text-2xl font-bold text-white">{data.overview.studentsAtRiskCount}</span>
                    </div>
                    <h3 className="font-semibold text-slate-200">Students at Risk</h3>
                    <p className="text-xs text-slate-400 mt-1">AI flagged {data.overview.studentsAtRiskCount} students this week.</p>
                </Card>

                {/* Card 4: Announcements */}
                <Card className="p-5 border-l-4 border-l-emerald-500 bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                            <Megaphone size={20} />
                        </div>
                        <span className="text-2xl font-bold text-white">{data.overview.announcementsCount}</span>
                    </div>
                    <h3 className="font-semibold text-slate-200">Announcements</h3>
                    <p className="text-xs text-slate-400 mt-1">Posted this week.</p>
                </Card>
            </div>

            {/* BAND 2: CLASSES & ASSIGNMENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: My Courses */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <BookOpen size={20} className="text-slate-400" /> My Courses
                        </h2>
                    </div>

                    {data.courses.length === 0 ? (
                        <Card className="p-8 text-center border-dashed border-2 border-slate-700 bg-transparent">
                            <GraduationCap className="mx-auto h-10 w-10 text-slate-600 mb-2" />
                            <p className="text-slate-400 font-medium">No courses yet.</p>
                            <Button variant="ghost" size="sm" className="mt-2 text-violet-400" onClick={() => navigate('/create-course')}>Create your first course</Button>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {data.courses.map(course => (
                                <div key={course.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl hover:border-violet-500/50 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-violet-300 transition-colors">{course.name}</h3>
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                                <span className="bg-slate-700 px-1.5 rounded">{course.code}</span>
                                                <span>• {course.studentsCount} Students</span>
                                                <span>• {course.section}</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => navigate(`/course/${course.id}`)}>Open</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Assignments & Grading */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <Layout size={20} className="text-slate-400" /> Assignments & Grading
                        </h2>
                        {/* Tabs */}
                        <div className="flex bg-slate-800 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'active' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setActiveTab('grading')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'grading' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                To Grade
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-1 min-h-[300px]">
                        {activeTab === 'active' && (
                            <div className="space-y-1">
                                {data.assignments.filter(a => a.status === 'Active').length > 0 ? (
                                    data.assignments.filter(a => a.status === 'Active').map(assignment => (
                                        <div key={assignment.id} className="p-3 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                                    <BookOpen size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-slate-200 text-sm">{assignment.title}</h4>
                                                    <p className="text-xs text-slate-500">{assignment.courseName} • Due {format(new Date(assignment.dueAt), 'MMM d')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Open</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500">No active assignments.</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'grading' && (
                            <div className="space-y-1">
                                {data.assignments.filter(a => a.ungradedCount > 0).length > 0 ? (
                                    data.assignments.filter(a => a.ungradedCount > 0).map(assignment => (
                                        <div key={assignment.id} className="p-3 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/assignments/${assignment.id}`)}>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                                    <CheckCircle size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-slate-200 text-sm">{assignment.title}</h4>
                                                    <p className="text-xs text-slate-500">{assignment.courseName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <span className="block text-sm font-bold text-slate-200">{assignment.ungradedCount} / {assignment.submittedCount}</span>
                                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">To Grade</span>
                                                </div>
                                                <ArrowRight size={16} className="text-slate-600 group-hover:text-white" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                                        <CheckCircle size={32} className="mb-2 opacity-50" />
                                        <p>All caught up!</p>
                                        <p className="text-xs">No pending submissions to grade.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* BAND 3: STUDENTS & AI INSIGHTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Students Needing Support */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-400" /> Students Needing Support
                    </h2>

                    <Card className="overflow-hidden bg-slate-800/30 border-slate-700/50">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900/50 text-slate-500 font-medium border-b border-slate-700/50">
                                <tr>
                                    <th className="p-4">Student</th>
                                    <th className="p-4">Course</th>
                                    <th className="p-4">Flagged Issue</th>
                                    <th className="p-4">Suggested Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {data.studentsAtRisk.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-medium text-slate-200">{student.name}</td>
                                        <td className="p-4">{student.course}</td>
                                        <td className="p-4 text-orange-300">{student.issue}</td>
                                        <td className="p-4">
                                            <Button size="sm" variant="ghost" className="h-8 text-violet-400 hover:text-violet-300 hover:bg-violet-900/20">
                                                {student.action}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.studentsAtRisk.length === 0 && (
                            <div className="p-8 text-center text-slate-500">
                                No students currently flagged as at-risk. Great job!
                            </div>
                        )}
                    </Card>
                </div>

                {/* AI Teaching Assistant Panel */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Sparkles size={20} className="text-violet-400" /> AI Assistant
                    </h2>
                    <Card className="p-6 bg-gradient-to-b from-indigo-900/20 to-slate-900 border-indigo-500/20">
                        <p className="text-sm text-indigo-200 mb-6">
                            Use NexusAI to plan, assess, and understand your classes faster.
                        </p>

                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-3 border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-100 group"
                                onClick={() => handleAiAction('feedback')}
                                isLoading={aiLoading === 'feedback'}
                            >
                                <span className="bg-indigo-500/20 p-2 rounded-lg mr-3 group-hover:bg-indigo-500/30 transition-colors">
                                    <MessageSquare size={16} className="text-indigo-400" />
                                </span>
                                <div>
                                    <span className="block font-medium text-sm">Draft Feedback</span>
                                    <span className="block text-xs text-indigo-300/60">For low scorers on recent quiz</span>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-3 border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-100 group"
                                onClick={() => handleAiAction('summary')}
                                isLoading={aiLoading === 'summary'}
                            >
                                <span className="bg-indigo-500/20 p-2 rounded-lg mr-3 group-hover:bg-indigo-500/30 transition-colors">
                                    <Clock size={16} className="text-indigo-400" />
                                </span>
                                <div>
                                    <span className="block font-medium text-sm">Summarize Performance</span>
                                    <span className="block text-xs text-indigo-300/60">Weekly class digest</span>
                                </div>
                            </Button>

                            <Button variant="outline" className="w-full justify-start text-left h-auto py-3 border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-100 group" onClick={() => navigate('/create-course')}>
                                <span className="bg-indigo-500/20 p-2 rounded-lg mr-3 group-hover:bg-indigo-500/30 transition-colors">
                                    <BookOpen size={16} className="text-indigo-400" />
                                </span>
                                <div>
                                    <span className="block font-medium text-sm">Plan Next Lesson</span>
                                    <span className="block text-xs text-indigo-300/60">Generate syllabus & materials</span>
                                </div>
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    );
};

export default TeacherDashboard;
