import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAssignment, submitAssignment, type Assignment } from '../services/assignmentService';
import { Button, Textarea, PageHeader, Card, CodeBlock } from '../components/ui';
import { ArrowLeft, Clock, FileText, CheckCircle, AlertCircle, UploadCloud } from 'lucide-react';

const AssignmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissionText, setSubmissionText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadAssignment = async () => {
            if (id) {
                const data = await getAssignment(id);
                setAssignment(data);
                // Pre-fill submission if exists
                if (data?.submission?.content) {
                    setSubmissionText(data.submission.content);
                }
            }
            setLoading(false);
        };
        loadAssignment();
    }, [id]);

    const handleSubmit = async () => {
        if (!assignment || !currentUser) return;
        setSubmitting(true);
        try {
            await submitAssignment({
                assignmentId: assignment._id,
                studentId: currentUser.uid,
                content: submissionText,
                // In a real app, handle file uploads to Firebase Storage/S3 here
            });
            // Refresh to show status
            const updated = await getAssignment(assignment._id);
            setAssignment(updated);
            alert("Assignment submitted successfully!");
        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading assignment...</div>;
    if (!assignment) return <div className="p-8 text-center text-slate-400">Assignment not found.</div>;

    const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded';
    const isGraded = assignment.status === 'graded';

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 text-slate-400 hover:text-white">
                <ArrowLeft className="mr-2" size={20} /> Back
            </Button>

            <PageHeader
                title={assignment.title}
                subtitle={`${assignment.type.toUpperCase()} • ${assignment.points} Points`}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                            <FileText className="mr-2 text-indigo-400" /> Instructions
                        </h3>
                        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
                            {assignment.description}
                        </div>
                    </Card>

                    {/* Submission Area */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                            <UploadCloud className="mr-2 text-sky-400" /> Your Submission
                        </h3>

                        {isGraded ? (
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <p className="text-sm text-slate-400 mb-2">Submitted Content:</p>
                                <CodeBlock code={assignment.submission?.content || ''} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Textarea
                                    value={submissionText}
                                    onChange={(e) => setSubmissionText(e.target.value)}
                                    placeholder="Type your answer here, or paste a link to your project..."
                                    rows={8}
                                    disabled={isSubmitted}
                                />
                                {!isSubmitted && (
                                    <div className="flex justify-end">
                                        <Button onClick={handleSubmit} isLoading={submitting} disabled={!submissionText.trim()}>
                                            Submit Assignment
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Col: Meta & Feedback */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-semibold text-slate-200 mb-4">Details</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Due Date</span>
                                <span className="text-slate-200">{new Date(assignment.dueAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Time Remaining</span>
                                <span className="text-amber-400 flex items-center gap-1">
                                    <Clock size={14} /> 2 days
                                </span>
                            </div>
                            <div className="pt-4 border-t border-slate-700">
                                <span className="text-slate-400 block mb-2">Status</span>
                                {isGraded ? (
                                    <div className="bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded border border-emerald-500/20 text-center font-bold">
                                        Graded: {assignment.submission?.grade}/{assignment.points}
                                    </div>
                                ) : isSubmitted ? (
                                    <div className="bg-sky-500/10 text-sky-400 px-3 py-2 rounded border border-sky-500/20 text-center font-bold flex items-center justify-center gap-2">
                                        <CheckCircle size={16} /> Submitted
                                    </div>
                                ) : (
                                    <div className="bg-slate-700/50 text-slate-400 px-3 py-2 rounded border border-slate-600 text-center">
                                        Not Submitted
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {isGraded && (
                        <Card className="p-6 border-emerald-500/30">
                            <h3 className="font-bold text-emerald-400 mb-2 flex items-center">
                                <CheckCircle className="mr-2" size={18} /> Teacher Feedback
                            </h3>
                            <p className="text-slate-300 italic">
                                "{assignment.submission?.feedback || "Great job!"}"
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentDetail;
