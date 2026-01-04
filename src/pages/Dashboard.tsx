import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, ScrollReveal } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import {
    Layout, Brain, Trophy, Calendar, Clock, ArrowRight,
    BookOpen, CheckCircle, AlertCircle, Zap
} from 'lucide-react';
import { getStudentDashboard, type StudentDashboardData } from '../services/dashboardService';
import { getDashboardInsights } from '../services/ai/geminiService'; // Import AI service
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<StudentDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (currentUser?.uid) {
                setLoading(true);
                const result = await getStudentDashboard(currentUser.uid);

                if (result) {
                    // Fetch AI Insight based on real stats
                    // Only fetch if not already present or refresh needed (simple implementation for MVP)
                    try {
                        const aiInsight = await getDashboardInsights({
                            streak: result.stats.streak,
                            mastery: result.stats.mastery,
                            tasksCount: result.stats.tasksCount,
                            recentTaskTitle: result.today[0]?.title
                        });
                        result.insight = aiInsight; // Override default backend mock
                    } catch (e) { console.warn("AI Insight failed, using fallback"); }

                    setData(result);
                }
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [currentUser]);

    if (loading) return <div className="p-8 text-center text-slate-400">Loading your space...</div>;
    if (!data) return null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">

            {/* Header / Welcome */}
            <ScrollReveal>
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl ring-1 ring-slate-700 shadow-xl mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                {data.greeting}, {currentUser?.displayName?.split(' ')[0] || 'Learner'} <span className="text-2xl">👋</span>
                            </h1>
                            <p className="text-slate-400 mt-1">
                                {currentUser?.university || 'University Student'} • {currentUser?.primarySubject || 'General Studies'}
                            </p>
                        </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-700/50 pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-500/20 rounded-xl text-violet-300 ring-1 ring-violet-500/30">
                                <Layout className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Today's Tasks</p>
                                <p className="text-xl font-bold text-slate-100">{data.stats.tasksCount} Pending</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-300 ring-1 ring-emerald-500/30">
                                <Brain className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Mastery Score</p>
                                <p className="text-xl font-bold text-slate-100">{data.stats.mastery}% Avg</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-300 ring-1 ring-amber-500/30">
                                <Zap className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Streak</p>
                                <p className="text-xl font-bold text-slate-100">{data.stats.streak} Days</p>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Tasks & Schedule */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Today's Tasks */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                            <CheckCircle size={20} className="text-violet-400" /> Today's Focus
                        </h2>
                        <div className="space-y-3">
                            {data.today.length === 0 ? (
                                <Card className="p-8 text-center border-dashed border-2 border-slate-700 bg-transparent">
                                    <p className="text-slate-400">No urgent tasks for today.</p>
                                    <Button variant="ghost" className="mt-2 text-violet-400">Browse Assignments</Button>
                                </Card>
                            ) : (
                                data.today.map(task => (
                                    <Card key={task.id} className="p-4 hover:border-violet-500/50 transition-colors group cursor-pointer" onClick={() => navigate(`/assignments/${task.id}`)}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${task.type === 'quiz' ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {task.type === 'quiz' ? <Brain size={20} /> : <BookOpen size={20} />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-200 group-hover:text-violet-300 transition-colors">{task.title}</h3>
                                                    <p className="text-sm text-slate-400 flex items-center gap-2">
                                                        <span>{task.course}</span>
                                                        {task.isUrgent && <span className="text-amber-400 flex items-center gap-1"><AlertCircle size={12} /> Due Soon</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-slate-500">{format(new Date(task.dueAt), 'MMM d, h:mm a')}</span>
                                                <ArrowRight size={18} className="text-slate-600 group-hover:text-white" />
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* AI Insight Card */}
                    <Card className="p-6 bg-gradient-to-r from-indigo-900/40 to-slate-900 border-indigo-500/30">
                        <div className="flex gap-4">
                            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-300 h-fit">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-indigo-100 mb-1">{data.insight.title}</h3>
                                <p className="text-indigo-200/80 leading-relaxed text-sm">
                                    {data.insight.message}
                                </p>
                                <Button size="sm" variant="ghost" className="mt-3 p-0 text-indigo-400 hover:text-indigo-300">
                                    View Recommendations &rarr;
                                </Button>
                            </div>
                        </div>
                    </Card>

                </div>

                {/* Right Column: Schedule & Quick Links */}
                <div className="space-y-6">

                    {/* Schedule */}
                    <Card className="p-5">
                        <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-emerald-400" /> Upcoming Classes
                        </h3>
                        <div className="space-y-4">
                            {data.schedule.map((item, i) => (
                                <div key={i} className="flex gap-4 relative pb-4 last:pb-0 last:after:hidden after:content-[''] after:absolute after:left-[19px] after:top-8 after:bottom-0 after:w-0.5 after:bg-slate-800">
                                    <div className="z-10 bg-slate-900 border border-slate-700 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                                        {item.time.split(':')[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-300 text-sm">{item.course}</p>
                                        <p className="text-xs text-slate-500">{item.time} • {item.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
};

// Helper Icon for Insight
function Sparkles({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}

export default Dashboard;
