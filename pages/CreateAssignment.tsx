import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createAssignment } from '../services/assignmentService';
import { getCourses, type Course } from '../services/courseService';
import { Button, Input, Textarea, Select, PageHeader, Card } from '../components/ui';
import { BookOpen, Calendar, Save, ArrowLeft } from 'lucide-react';

const CreateAssignment: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        dueAt: '',
        points: 100,
        type: 'homework' // 'quiz' | 'homework' | 'project'
    });

    useEffect(() => {
        const loadCourses = async () => {
            if (currentUser?.uid) {
                const c = await getCourses();
                setCourses(c);
                if (c.length > 0) {
                    setFormData(prev => ({ ...prev, courseId: c[0].id }));
                }
            }
        };
        loadCourses();
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.uid) return;
        setLoading(true);

        try {
            await createAssignment({
                ...formData,
                teacherId: currentUser.uid,
                points: Number(formData.points)
            });
            // Success
            navigate('/teacher-dashboard');
        } catch (error) {
            console.error("Failed to create assignment", error);
            alert("Failed to create assignment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:bg-transparent text-slate-400 hover:text-white">
                <ArrowLeft className="mr-2" size={20} /> Back to Dashboard
            </Button>

            <PageHeader
                title="Create New Assignment"
                subtitle="Design a task, quiz, or project for your students."
            />

            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Assignment Title</label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., React Component Lifecycle"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Instructions / Description</label>
                        <Textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Detailed instructions for the students..."
                            rows={6}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Course Select */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Target Course</label>
                            <div className="relative">
                                <Select
                                    name="courseId"
                                    value={formData.courseId}
                                    onChange={handleChange}
                                    required
                                >
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </Select>
                                <BookOpen className="absolute right-3 top-3 text-slate-500 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Due Date & Time</label>
                            <div className="relative">
                                <Input
                                    type="datetime-local"
                                    name="dueAt"
                                    value={formData.dueAt}
                                    onChange={handleChange}
                                    required
                                    className="text-slate-200" // Ensure calendar icon is visible/styled if possible
                                />
                                <Calendar className="absolute right-3 top-3 text-slate-500 pointer-events-none hidden md:block" size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Assignment Type</label>
                            <Select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="homework">Homework</option>
                                <option value="quiz">Quiz</option>
                                <option value="project">Project</option>
                            </Select>
                        </div>

                        {/* Points */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Max Points</label>
                            <Input
                                type="number"
                                name="points"
                                value={formData.points}
                                onChange={handleChange}
                                min={0}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-700 flex justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={() => navigate('/teacher-dashboard')}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={loading} className="px-8">
                            <Save className="mr-2" size={18} />
                            Publish Assignment
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateAssignment;
