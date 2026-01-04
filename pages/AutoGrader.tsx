import React, { useState } from 'react';
import { PageHeader, Button, Input, Textarea, Card } from '../components/ui';
import { gradeAssignment, type GradeResult } from '../services/gradingService';
import { CheckCircle, AlertCircle, Sparkles, Loader2, BookOpen, GraduationCap } from 'lucide-react';

const AutoGrader: React.FC = () => {
    const [rubric, setRubric] = useState('');
    const [question, setQuestion] = useState('');
    const [submission, setSubmission] = useState('');
    const [result, setResult] = useState<GradeResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGrade = async () => {
        if (!rubric || !submission) return;
        setIsLoading(true);
        try {
            const grade = await gradeAssignment(rubric, "High School", question, submission);
            setResult(grade);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="AI Auto-Grader"
                subtitle="Instant, consistent grading based on your custom rubrics."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <Card className="p-6 border-slate-700 bg-slate-800/50">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Assignment Question</label>
                                <Input
                                    placeholder="e.g. Explain the causes of WWI"
                                    value={question}
                                    onChange={e => setQuestion(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Grading Rubric</label>
                                <Textarea
                                    placeholder="e.g. 5 pts for identifying alliances, 5 pts for assassination event..."
                                    className="h-32"
                                    value={rubric}
                                    onChange={e => setRubric(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Student Submission</label>
                                <Textarea
                                    placeholder="Paste student answer here..."
                                    className="h-48 font-mono text-sm"
                                    value={submission}
                                    onChange={e => setSubmission(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleGrade} disabled={isLoading || !rubric || !submission} className="w-full">
                                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Grading...</> : <><Sparkles className="w-4 h-4 mr-2" /> Grade Assignment</>}
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Output */}
                <div>
                    {!result && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/20">
                            <GraduationCap className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg text-center">Enter rubric and submission to start.</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400">
                            <Loader2 className="w-12 h-12 mb-4 animate-spin text-violet-500" />
                            <p>Analyzing submission against rubric...</p>
                        </div>
                    )}

                    {result && (
                        <Card className="bg-slate-900 border-violet-500/30 overflow-hidden ring-1 ring-violet-500/50 p-0">
                            <div className="bg-violet-900/20 p-6 border-b border-violet-500/10 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-violet-300 uppercase tracking-wider font-semibold">Total Score</p>
                                    <div className="text-4xl font-bold text-white mt-1">{result.score} <span className="text-xl text-slate-400 font-normal">/ {result.maxScore}</span></div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 ${result.confidence > 0.8 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {result.confidence > 0.8 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        {Math.round(result.confidence * 100)}% Confidence
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-300 mb-2">Feedback</h4>
                                    <p className="text-slate-400 leading-relaxed bg-slate-800/50 p-4 rounded-lg italic">"{result.feedback}"</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Strengths</h4>
                                        <ul className="space-y-1">
                                            {result.strengths.map((s, i) => (
                                                <li key={i} className="flex gap-2 text-sm text-slate-300">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500/50 flex-shrink-0" /> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Improvements</h4>
                                        <ul className="space-y-1">
                                            {result.improvements.map((s, i) => (
                                                <li key={i} className="flex gap-2 text-sm text-slate-300">
                                                    <AlertCircle className="w-4 h-4 text-amber-500/50 flex-shrink-0" /> {s}
                                                </li>
                                            ))}
                                        </ul>
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

export default AutoGrader;
