import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button } from '../components/ui';
import { ClipboardList, CheckCircle, BarChart2, Users, Brain, BookOpen } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();

    const tools = [
        {
            title: "AI Lesson Planner",
            description: "Generate structured lesson plans, slides, and worksheets instantly using Gemini 2.0.",
            icon: ClipboardList,
            path: "/lesson-planner",
            color: "text-violet-400",
            bgColor: "bg-violet-500/10"
        },
        {
            title: "Auto-Grader System",
            description: "AI-powered grading for essays and assignments with detailed feedback and rubrics.",
            icon: CheckCircle,
            path: "/auto-grader",
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10"
        },
        {
            title: "Class Analytics",
            description: "View student progress, engagement metrics, and mastery heatmaps.",
            icon: BarChart2,
            path: "/insights", // Re-using insights for now
            color: "text-blue-400",
            bgColor: "bg-blue-500/10"
        },
        {
            title: "Student Management",
            description: "Manage class rosters, attendance, and student profiles.",
            icon: Users,
            path: "/study-lobby", // Placeholder
            color: "text-pink-400",
            bgColor: "bg-pink-500/10"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in-50">
            <PageHeader
                title="Teacher Command Center"
                subtitle="Manage your classroom, generate content, and track student progress with AI."
            />

            {/* Quick Stats Row (Mock Data for Visuals) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-violet-600/20 text-violet-400">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Active Courses</p>
                            <h3 className="text-2xl font-bold text-white">4</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-600/20 text-emerald-400">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Total Students</p>
                            <h3 className="text-2xl font-bold text-white">128</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-600/20 text-amber-400">
                            <Brain size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">AI Lessons Generated</p>
                            <h3 className="text-2xl font-bold text-white">42</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <h2 className="text-xl font-semibold text-slate-200 mt-8">AI Productivity Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool) => (
                    <div
                        key={tool.title}
                        onClick={() => navigate(tool.path)}
                        className="group relative overflow-hidden rounded-xl bg-slate-800 border border-slate-700 hover:border-violet-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-violet-900/20 p-6"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-lg ${tool.bgColor} ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <tool.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                                        {tool.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        {tool.description}
                                    </p>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <Button variant="ghost" className="text-slate-300 hover:text-white">
                                    Open &rarr;
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherDashboard;
