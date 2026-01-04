import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAssignment, submitAssignment, gradeAssignment, type Assignment } from '../services/assignmentService';
import {
    Button, Textarea, PageHeader, Card, Input
} from '../components/ui';
import { ArrowLeft, Clock, FileText, CheckCircle, AlertCircle, UploadCloud, Users, Award } from 'lucide-react';
import axios from 'axios';

const AssignmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [submissionText, setSubmissionText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Grading state
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [gradeValue, setGradeValue] = useState('');
    const [feedbackValue, setFeedbackValue] = useState('');
    const [grading, setGrading] = useState(false);

    const isTeacher = currentUser?.role === 'teacher';

    useEffect(() => {
        const loadAssignment = async () => {
            if (id) {
                const data = await getAssignment(id);
                setAssignment(data);

                // For student: pre-fill submission if exists
                if (!isTeacher && data?.submission?.content) {
                    setSubmissionText(data.submission.content);
                }

                // For teacher: fetch all submissions
                if (isTeacher && data) {
                    try {
                        const res = await axios.get(`http://localhost:5000/api/assignments/${id}/submissions`);
                        setSubmissions(res.data || []);
                    } catch (e) {
                        console.warn("Could not fetch submissions", e);
                    }
                }
            }
            setLoading(false);
        };
        loadAssignment();
    }, [id, isTeacher]);

    const handleSubmit = async () => {
        if (!assignment || !currentUser) return;
        setSubmitting(true);
        try {
            await submitAssignment({
                assignmentId: assignment._id,
                studentId: currentUser.uid,
                content: submissionText,
            });
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

    const handleGrade = async () => {
        if (!selectedSubmission) return;
        setGrading(true);
        try {
            await gradeAssignment({
                submissionId: selectedSubmission._id,
                grade: Number(gradeValue),
                feedback: feedbackValue
            });
            // Refresh submissions
            const res = await axios.get(`http://localhost:5000/api/assignments/${id}/submissions`);
            setSubmissions(res.data || []);
            setSelectedSubmission(null);
            setGradeValue('');
            setFeedbackValue('');
            alert("Graded successfully!");
        } catch (error) {
            console.error("Grading failed", error);
            alert("Failed to grade. Please try again.");
        } finally {
            setGrading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading assignment...</div>;
    if (!assignment) return <div className="p-8 text-center text-slate-400">Assignment not found.</div>;

    const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded';
    const isGraded = assignment.status === 'graded';

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 text-slate-400 hover:text-white">
                <ArrowLeft className="mr-2" size={20} /> Back
            </Button>

            <PageHeader
                title={assignment.title}
                subtitle={`${assignment.type.toUpperCase()} • ${assignment.points} Points`}
            />

            {isTeacher ? (
                /* ========== TEACHER VIEW ========== */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                                <FileText className="mr-2 text-indigo-400" /> Instructions
                            </h3>
                            <p className="text-slate-300 whitespace-pre-wrap">{assignment.description}</p>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                                <Users className="mr-2 text-violet-400" /> Student Submissions ({submissions.length})
                            </h3>
                            {submissions.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No submissions yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {submissions.map(sub => (
                                        <div
                                            key={sub._id}
                                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedSubmission?._id === sub._id ? 'bg-violet-900/30 border-violet-500' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
                                            onClick={() => { setSelectedSubmission(sub); setGradeValue(sub.grade?.toString() || ''); setFeedbackValue(sub.feedback || ''); }}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-slate-200">{sub.studentId}</span>
                                                {sub.status === 'graded' ? (
                                                    <span className="text-emerald-400 text-sm flex items-center gap-1"><Award size={14} /> {sub.grade}/{assignment.points}</span>
                                                ) : (
                                                    <span className="text-amber-400 text-sm">Needs Grading</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right: Grading Panel */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="font-semibold text-slate-200 mb-4">Assignment Info</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-slate-400">Due Date</span><span className="text-slate-200">{new Date(assignment.dueAt).toLocaleDateString()}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Max Points</span><span className="text-slate-200">{assignment.points}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Submissions</span><span className="text-slate-200">{submissions.length}</span></div>
                            </div>
                        </Card>

                        {selectedSubmission && (
                            <Card className="p-6 border-violet-500/30">
                                <h3 className="font-bold text-violet-400 mb-4">Grade Submission</h3>
                                <div className="space-y-4">
                                    <div className="bg-slate-900/50 p-3 rounded text-sm text-slate-300 max-h-40 overflow-y-auto">
                                        {selectedSubmission.content}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Score</label>
                                        <Input type="number" value={gradeValue} onChange={e => setGradeValue(e.target.value)} min={0} max={assignment.points} placeholder={`0-${assignment.points}`} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Feedback</label>
                                        <Textarea value={feedbackValue} onChange={e => setFeedbackValue(e.target.value)} rows={3} placeholder="Write feedback..." />
                                    </div>
                                    <Button onClick={handleGrade} isLoading={grading} disabled={!gradeValue} className="w-full bg-emerald-600">
                                        Save Grade
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            ) : (
                /* ========== STUDENT VIEW ========== */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                                <FileText className="mr-2 text-indigo-400" /> Instructions
                            </h3>
                            <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
                                {assignment.description}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                                <UploadCloud className="mr-2 text-sky-400" /> Your Submission
                            </h3>
                            {isGraded ? (
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                    <p className="text-sm text-slate-400 mb-2">Submitted Content:</p>
                                    <p className="text-slate-300">{assignment.submission?.content}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Textarea value={submissionText} onChange={e => setSubmissionText(e.target.value)} placeholder="Type your answer here..." rows={8} disabled={isSubmitted} />
                                    {!isSubmitted && (
                                        <div className="flex justify-end">
                                            <Button onClick={handleSubmit} isLoading={submitting} disabled={!submissionText.trim()}>Submit Assignment</Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="font-semibold text-slate-200 mb-4">Details</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between"><span className="text-slate-400">Due Date</span><span className="text-slate-200">{new Date(assignment.dueAt).toLocaleDateString()}</span></div>
                                <div className="pt-4 border-t border-slate-700">
                                    <span className="text-slate-400 block mb-2">Status</span>
                                    {isGraded ? (
                                        <div className="bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded border border-emerald-500/20 text-center font-bold">Graded: {assignment.submission?.grade}/{assignment.points}</div>
                                    ) : isSubmitted ? (
                                        <div className="bg-sky-500/10 text-sky-400 px-3 py-2 rounded border border-sky-500/20 text-center font-bold flex items-center justify-center gap-2"><CheckCircle size={16} /> Submitted</div>
                                    ) : (
                                        <div className="bg-slate-700/50 text-slate-400 px-3 py-2 rounded border border-slate-600 text-center">Not Submitted</div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {isGraded && (
                            <Card className="p-6 border-emerald-500/30">
                                <h3 className="font-bold text-emerald-400 mb-2 flex items-center"><CheckCircle className="mr-2" size={18} /> Teacher Feedback</h3>
                                <p className="text-slate-300 italic">"{assignment.submission?.feedback || "Great job!"}"</p>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentDetail;

