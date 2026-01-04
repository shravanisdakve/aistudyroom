import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Textarea, Card, PageHeader } from '../components/ui';
import { Sparkles, Save, BookOpen, Clock, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { generateSyllabus } from '../services/ai/geminiService';
import { addCourse } from '../services/courseService';

const CreateCourse: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Form State
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState('Beginner');
    const [duration, setDuration] = useState('4 Weeks');
    const [courseName, setCourseName] = useState('');

    // Generated Content
    const [syllabusData, setSyllabusData] = useState<any>(null);

    const handleGenerate = async () => {
        if (!topic) return;
        setGenerating(true);
        try {
            const result = await generateSyllabus(topic, level, duration);
            const parsed = JSON.parse(result);
            setSyllabusData(parsed);
            if (!courseName) setCourseName(topic);
        } catch (error) {
            console.error(error);
            alert("Failed to generate syllabus. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!courseName || !currentUser?.uid) return;
        setLoading(true);
        try {
            // Let's do a direct fetch here to ensure all fields are sent until service is updated
            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    name: courseName,
                    color: '#8b5cf6', // Default violet
                    description: syllabusData?.description || '',
                    level,
                    duration,
                    syllabus: syllabusData?.syllabus || []
                })
            });

            if (response.ok) {
                navigate('/teacher-dashboard');
            } else {
                throw new Error("Failed to save");
            }

        } catch (error) {
            console.error(error);
            alert("Failed to save course.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 text-slate-400 hover:text-white">
                <ArrowLeft className="mr-2" size={20} /> Back to Dashboard
            </Button>

            <PageHeader
                title="Create New Course"
                subtitle="Design your curriculum manually or let AI draft a syllabus for you."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Input */}
                <Card className="p-6 space-y-6 h-fit">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Sparkles className="text-violet-400" size={20} /> AI Course Designer
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Topic / Subject</label>
                        <Input
                            placeholder="e.g. Introduction to Astrophysics"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Target Level</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-violet-500"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                                <option>K-12 (High School)</option>
                                <option>University</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-violet-500"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            >
                                <option>4 Weeks</option>
                                <option>8 Weeks</option>
                                <option>12 Weeks</option>
                                <option>Semester</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={generating || !topic}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-none"
                    >
                        {generating ? <><Loader2 className="animate-spin mr-2" /> Designing...</> : <><Sparkles className="mr-2" /> Generate Syllabus</>}
                    </Button>
                </Card>

                {/* Right: Preview & Save */}
                <div className="lg:col-span-2 space-y-6">
                    {syllabusData ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Course Name Input (Editable) */}
                            <Card className="p-6 border-violet-500/30 ring-1 ring-violet-500/20 bg-slate-900/50">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">Course Title</label>
                                        <Input
                                            value={courseName}
                                            onChange={(e) => setCourseName(e.target.value)}
                                            className="text-xl font-bold bg-transparent border-none p-0 h-auto focus:ring-0 placeholder:text-slate-600"
                                            placeholder="Course Name"
                                        />
                                    </div>
                                    <Button onClick={handleSave} isLoading={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Save className="mr-2" size={18} /> Save Course
                                    </Button>
                                </div>
                                <p className="text-slate-300 mb-4">{syllabusData.description}</p>

                                <div className="flex gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1"><Users size={14} /> {level}</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> {duration}</span>
                                </div>
                            </Card>

                            {/* Syllabus Timeline */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-200">Course Syllabus</h3>
                                {syllabusData.syllabus.map((week: any, i: number) => (
                                    <Card key={i} className="p-4 flex gap-4 hover:border-violet-500/30 transition-colors">
                                        <div className="flex-shrink-0 w-16 h-16 bg-slate-800 rounded-lg flex flex-col items-center justify-center border border-slate-700 text-slate-300">
                                            <span className="text-xs uppercase font-bold text-slate-500">Week</span>
                                            <span className="text-xl font-bold text-white">{week.week}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-100 text-lg mb-1">{week.topic}</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed">{week.content}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-slate-500">
                            <BookOpen size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium">Ready to design your course?</p>
                            <p className="text-sm">Enter a topic on the left to generate a complete syllabus.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
