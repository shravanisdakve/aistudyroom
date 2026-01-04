import React, { useState } from 'react';
import { PageHeader, Button, Input, Card } from '../components/ui';
import { generateLessonPlan, type LessonPlan } from '../services/lessonPlannerService';
import { BookOpen, Clock, Users, Download, Loader2, FileText, CheckCircle, Sparkles } from 'lucide-react';

const LessonPlanner: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [grade, setGrade] = useState('');
    const [duration, setDuration] = useState('60 mins');
    const [plan, setPlan] = useState<LessonPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic || !grade) return;

        setIsLoading(true);
        try {
            const result = await generateLessonPlan(topic, grade, duration);
            setPlan(result);
        } catch (error) {
            console.error(error);
            // Show toast error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="AI Lesson Planner"
                subtitle="Create a comprehensive, curriculum-aligned lesson plan in seconds."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-1">
                    <Card className="p-6 bg-slate-800/50 border-slate-700">
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
                                <Input
                                    placeholder="e.g. Newton's Laws of Motion"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Grade Level</label>
                                <Input
                                    placeholder="e.g. Grade 9 / High School"
                                    value={grade}
                                    onChange={e => setGrade(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                                <select
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                >
                                    <option>30 mins</option>
                                    <option>45 mins</option>
                                    <option>60 mins</option>
                                    <option>90 mins</option>
                                </select>
                            </div>

                            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" /> Generate Plan
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Output Display */}
                <div className="lg:col-span-2">
                    {!plan && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center p-12 py-24 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/20">
                            <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg">Enter details to generate your first plan.</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400">
                            <Loader2 className="w-12 h-12 mb-4 animate-spin text-violet-500" />
                            <p>Designing optimal learning path...</p>
                        </div>
                    )}

                    {plan && (
                        <Card className="bg-slate-900 border-violet-500/30 overflow-hidden ring-1 ring-violet-500/50">
                            {/* Paper Header */}
                            <div className="bg-violet-900/30 border-b border-violet-500/20 p-6 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">{plan.topic}</h2>
                                    <div className="flex gap-4 text-violet-200 text-sm">
                                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {plan.gradeLevel}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {plan.duration}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-violet-300 hover:text-white">
                                    <Download className="w-4 h-4 mr-2" /> Export PDF
                                </Button>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Objectives */}
                                <div>
                                    <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-3">Learning Objectives</h3>
                                    <ul className="space-y-2">
                                        {plan.objectives.map((obj, i) => (
                                            <li key={i} className="flex gap-3 text-slate-300">
                                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                {obj}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Flow */}
                                <div>
                                    <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-4">Lesson Flow</h3>
                                    <div className="space-y-4 border-l-2 border-slate-700 pl-4 ml-2">
                                        {plan.activities.map((act, i) => (
                                            <div key={i} className="relative">
                                                <div className="absolute -left-[25px] top-0 w-4 h-4 bg-slate-700 rounded-full border-2 border-slate-900"></div>
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h4 className="font-semibold text-white">{act.title}</h4>
                                                    <span className="text-xs font-mono text-slate-400">{act.duration}</span>
                                                </div>
                                                <p className="text-slate-400 text-sm">{act.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Materials & Assessment */}
                                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-800">
                                    <div>
                                        <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-3">Materials Needed</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                            {plan.materials.map((m, i) => <li key={i}>{m}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-3">Assessment</h3>
                                        <p className="text-sm text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-700">{plan.assessment}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonPlanner;
