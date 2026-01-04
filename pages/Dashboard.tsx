import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader, Button, ScrollReveal } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { getTimeOfDayGreeting } from '../services/personalizationService';
import { getUserProgress, type UserProgress } from '../services/progressService';
import { getUserMastery, type Mastery, updateMastery } from '../services/masteryService'; // Make sure this is exported
import { getStudentAssignments, type Assignment } from '../services/assignmentService';
import { getCourses, type Course } from '../services/courseService';
import {
    BookOpen, CheckCircle, Clock, TrendingUp, AlertCircle,
    Calendar, Trophy, Zap, MessageSquare, ArrowRight, Brain, FileText, Layout
} from 'lucide-react';

const LearnerHome: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [mastery, setMastery] = useState<Mastery[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [p, a, m, c] = await Promise.all([
                    getUserProgress(currentUser?.uid || ''),
                    getStudentAssignments(currentUser?.uid),
                    getUserMastery(currentUser?.uid || ''),
                    getCourses()
                ]);
                setProgress(p);
                setAssignments(a);
                setMastery(m);
                setCourses(c);
            } catch (err) {
                console.error("Dashboard load error", err);
            } finally {
                setLoading(false);
            }
        }
        if (currentUser) loadData();
    }, [currentUser]);

    const greeting = getTimeOfDayGreeting();
    const firstName = currentUser?.displayName?.split(' ')[0] || 'Learner';

    // Derived Data
    const todaysTasks = assignments.filter(a => {
        const due = new Date(a.dueAt);
        const now = new Date();
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 2 && a.status !== 'submitted';
    }).slice(0, 5); // Top 5 urgent

    const recentGraded = assignments.filter(a => a.status === 'graded').slice(0, 3);
    const overallMastery = mastery.length > 0
        ? Math.round(mastery.reduce((acc, curr) => acc + curr.score, 0) / mastery.length)
        : 0;

    // Find a weak topic
    const weakTopic = mastery.sort((a, b) => a.score - b.score)[0];

    if (loading) return <div className="p-8 text-center text-slate-400">Loading your space...</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* --- HEADER SECTION --- */}
            <ScrollReveal>
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl ring-1 ring-slate-700 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                {greeting}, {firstName} <span className="text-2xl">👋</span>
                            </h1>
                            <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
                                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                                    {currentUser?.university || 'University Student'}
                                </span>
                                {currentUser?.primarySubject && <span>• {currentUser.primarySubject}</span>}
                            </p>
                        </div>
                    </div>

                    {/* Status Strip */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-700/50 pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-500/20 rounded-xl text-violet-300 ring-1 ring-violet-500/30">
                                <Layout className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Today's Plan</p>
                                <p className="text-xl font-bold text-slate-100">{todaysTasks.length} Tasks</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-300 ring-1 ring-emerald-500/30">
                                <Brain className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Overall Mastery</p>
                                <p className="text-xl font-bold text-slate-100">{overallMastery}% Avg.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-300 ring-1 ring-amber-500/30">
                                <Zap className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Learning Streak</p>
                                <p className="text-xl font-bold text-slate-100">{progress?.streak || 0} Days</p>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- COLUMN 1: TODAY'S FOCUS --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Today's Tasks Widget */}
                    <ScrollReveal delay={0.1}>
                        <div className="bg-slate-800/50 rounded-xl p-0 ring-1 ring-slate-700 overflow-hidden">
                            <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/80">
                                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-sky-400" /> Today's Tasks
                                </h3>
                                <Link to="/assignments" className="text-xs text-violet-400 hover:text-violet-300 font-medium">View All</Link>
                            </div>

                            <div className="divide-y divide-slate-700/50">
                                {todaysTasks.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-slate-400 mb-2">You're all caught up!</p>
                                        <Button onClick={() => navigate('/quizzes')} variant="outline" size="sm">Start a Practice Quiz</Button>
                                    </div>
                                ) : (
                                    todaysTasks.map(task => (
                                        <div key={task._id} className="p-4 hover:bg-slate-700/30 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-10 rounded-full ${task.type === 'quiz' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">{task.title}</h4>
                                                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                                                        <span className="uppercase tracking-wide font-bold">{task.type}</span>
                                                        <span>•</span>
                                                        <span>Due {new Date(task.dueAt).toLocaleDateString()}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {task.status === 'pending' || !task.status ? (
                                                    <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20">ToDo</span>
                                                ) : (
                                                    <span className="text-xs bg-sky-500/10 text-sky-500 px-2 py-1 rounded border border-sky-500/20 capitalize">{task.status}</span>
                                                )}
                                                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => navigate(`/assignments/${task._id}`)}>
                                                    <ArrowRight size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Upcoming Classes (Placeholder) */}
                    <ScrollReveal delay={0.2}>
                        <div className="bg-slate-800/50 rounded-xl p-5 ring-1 ring-slate-700">
                            <h3 className="font-bold text-slate-100 flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-emerald-400" /> Upcoming Classes
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border-l-4 border-slate-600 opacity-60">
                                    <div>
                                        <p className="font-medium text-slate-300">No classes scheduled for today.</p>
                                        <p className="text-xs text-slate-500">Check back later for updates.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                </div>

                {/* --- COLUMN 2: PERFORMANCE & INSIGHTS --- */}
                <div className="space-y-6">

                    {/* Mastery Card */}
                    <ScrollReveal delay={0.3}>
                        <div className="bg-slate-900/50 rounded-xl p-5 ring-1 ring-slate-700 backdrop-blur-sm">
                            <h3 className="font-bold text-slate-100 flex items-center gap-2 mb-4">
                                <Trophy className="w-5 h-5 text-yellow-400" /> Top Subjects
                            </h3>
                            <div className="space-y-4">
                                {courses.slice(0, 3).map(course => {
                                    // Mock data binding for now until course-mastery linkage is tight
                                    const courseMastery = 65 + Math.floor(Math.random() * 25);
                                    return (
                                        <div key={course.id}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-300 font-medium">{course.name}</span>
                                                <span className="text-slate-400">{courseMastery}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{ width: `${courseMastery}%` }}></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <Button className="w-full mt-4 text-xs" variant="ghost" onClick={() => navigate('/progress')}>View Full Analytics</Button>
                        </div>
                    </ScrollReveal>

                    {/* AI Coach Suggestion */}
                    {weakTopic && (
                        <ScrollReveal delay={0.4}>
                            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 shadow-lg text-white">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Brain className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg">Focus Area</h3>
                                </div>
                                <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                                    You seem a bit shaky on <strong>{weakTopic.topic}</strong> ({weakTopic.score}%). A quick 5-minute quiz could help fix that!
                                </p>
                                <Button onClick={() => navigate('/quizzes')} className="w-full bg-white text-indigo-600 hover:bg-slate-100 border-none font-bold shadow-none">
                                    Practice Now
                                </Button>
                            </div>
                        </ScrollReveal>
                    )}

                    {/* Recently Graded */}
                    <ScrollReveal delay={0.5}>
                        <div className="bg-slate-800/50 rounded-xl p-5 ring-1 ring-slate-700">
                            <h3 className="font-bold text-slate-100 flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5 text-teal-400" /> Recently Graded
                            </h3>
                            <div className="space-y-3">
                                {recentGraded.length === 0 ? <p className="text-sm text-slate-400">No grades yet.</p> : recentGraded.map(item => (
                                    <div key={item._id} className="text-sm border-l-2 border-slate-600 pl-3 py-1">
                                        <p className="text-slate-200 font-medium">{item.title}</p>
                                        <p className="text-slate-400 flex justify-between mt-1">
                                            <span>Score: <span className="text-white font-bold">{item.submission?.grade || 0}/{item.points}</span></span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Quick Access Grid */}
                    <ScrollReveal delay={0.6}>
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/notes" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-center ring-1 ring-slate-700 transition-colors">
                                <FileText className="w-6 h-6 mx-auto mb-2 text-sky-400" />
                                <span className="text-xs font-semibold text-slate-300">Notes</span>
                            </Link>
                            <Link to="/tutor" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-center ring-1 ring-slate-700 transition-colors">
                                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-violet-400" />
                                <span className="text-xs font-semibold text-slate-300">AI Tutor</span>
                            </Link>
                        </div>
                    </ScrollReveal>

                </div>
            </div>
        </div>
    );
};

export default LearnerHome;
