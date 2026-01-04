import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTeacherAssignments, type Assignment } from '../services/assignmentService';
import { getCourses, type Course } from '../services/courseService';
import {
    Users, BookOpen, Clock, AlertTriangle, CheckSquare,
    BarChart2, Sparkles, MessageSquare, Plus, Search,
    MoreVertical, FileText
} from 'lucide-react';
import { Button, ScrollReveal } from '../components/ui';

const TeacherDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser?.uid) return;
            setLoading(true);
            try {
                const [a, c] = await Promise.all([
                    getTeacherAssignments(currentUser.uid),
                    getCourses() // Ideally filtered by teacher
                ]);
                setAssignments(a);
                setCourses(c);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [currentUser]);

    // Derived Stats
    const totalClasses = courses.length; // Simplified "Classes today"
    const pendingGrading = assignments.reduce((acc, curr) => acc + (curr.submittedCount || 0) - (curr.gradedCount || 0), 0);
    const atRiskStudents = 5; // Mocked for now, implies analytics service call

    const assignmentsToGrade = assignments.filter(a => (a.submittedCount || 0) > (a.gradedCount || 0));

    if (loading) return <div className="p-8 text-center text-slate-400">Loading Educator Space...</div>;

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
            {/* Header Section */}
            <ScrollReveal>
                <div className="bg-slate-900 border-b border-slate-800 pb-6">
                    <h1 className="text-3xl font-bold text-white">
                        Welcome, Prof. {currentUser?.displayName?.split(' ')[1] || 'Teacher'}
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded text-sm border border-indigo-500/20">
                            {currentUser?.university || 'University'}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">Computer Engineering Dept.</span>
                    </p>
                </div>
            </ScrollReveal>

            {/* Quick Stats Strip */}
            <ScrollReveal delay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{totalClasses}</p>
                            <p className="text-sm text-slate-400">Classes Taught Today</p>
                        </div>
                    </div>
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                            <CheckSquare size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{pendingGrading}</p>
                            <p className="text-sm text-slate-400">Submissions to Review</p>
                        </div>
                    </div>
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center gap-4">
                        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{atRiskStudents}</p>
                            <p className="text-sm text-slate-400">Students At-Risk</p>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Immediate Actions */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Grading Queue */}
                    <ScrollReveal delay={0.2}>
                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="p-5 border-b border-slate-700 flex justify-between items-center">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <FileText className="text-indigo-400" size={20} /> Grading Queue
                                </h3>
                                <Button size="sm" variant="outline" onClick={() => navigate('/create-assignment')}>
                                    <Plus size={16} className="mr-2" />
                                    Create Assignment
                                </Button>
                            </div>
                            <div className="divide-y divide-slate-700">
                                {assignmentsToGrade.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        No pending grading. Great job!
                                    </div>
                                ) : (
                                    assignmentsToGrade.map(a => (
                                        <div key={a._id} className="p-4 flex items-center justify-between hover:bg-slate-750 transition-colors">
                                            <div>
                                                <h4 className="font-medium text-slate-200">{a.title}</h4>
                                                <p className="text-sm text-slate-400 mt-1">
                                                    Due {new Date(a.dueAt).toLocaleDateString()} • {a.courseId}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-amber-400">
                                                        {(a.submittedCount || 0) - (a.gradedCount || 0)} Ungraded
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {a.submittedCount} Submitted
                                                    </p>
                                                </div>
                                                <Button size="sm" onClick={() => navigate(`/grading/${a._id}`)}>
                                                    Grade
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Today's Classes */}
                    <ScrollReveal delay={0.3}>
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                                <Clock className="text-emerald-400" size={20} /> Today's Classes
                            </h3>
                            <div className="space-y-3">
                                {courses.slice(0, 2).map((c, i) => (
                                    <div key={c.id} className="flex items-center justify-between p-4 bg-slate-750/50 rounded-lg border border-slate-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                                                {10 + i}:00
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200">{c.name}</p>
                                                <p className="text-sm text-slate-400">Lecture: Advanced Topics</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost">Generate Plan</Button>
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Start Class</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Column 2: Analytics & AI */}
                <div className="space-y-6">

                    {/* Class Performance */}
                    <ScrollReveal delay={0.4}>
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                                <BarChart2 className="text-violet-400" size={20} /> Class Performance
                            </h3>
                            <div className="space-y-4">
                                {courses.slice(0, 3).map(c => (
                                    <div key={c.id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-300">{c.name}</span>
                                            <span className="text-slate-400 font-mono">Avg: 78%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-violet-500" style={{ width: '78%' }}></div>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 p-3 bg-violet-500/10 rounded-lg border border-violet-500/20 flex gap-3">
                                    <Sparkles className="text-violet-400 flex-shrink-0" size={18} />
                                    <p className="text-sm text-violet-200">
                                        <strong>AI Insight:</strong> Students in "DBMS" struggled with Joins. Consider a recap session.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* AI TA Panel */}
                    <ScrollReveal delay={0.5}>
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl border border-indigo-500/30 p-5">
                            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                                <Sparkles className="text-indigo-400" size={20} /> AI Assistant
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors flex items-center gap-2">
                                    <MessageSquare size={16} /> Draft feedback for low scorers
                                </button>
                                <button className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors flex items-center gap-2">
                                    <BookOpen size={16} /> Generate quiz from last lecture
                                </button>
                                <button className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors flex items-center gap-2">
                                    <BarChart2 size={16} /> Summarize weekly progress
                                </button>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Students Needing Attention */}
                    <ScrollReveal delay={0.6}>
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                                <Users className="text-rose-400" size={20} /> Needs Attention
                            </h3>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs font-bold">
                                                S{i}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-200">Student {i}</p>
                                                <p className="text-xs text-rose-400">Low engagement</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
