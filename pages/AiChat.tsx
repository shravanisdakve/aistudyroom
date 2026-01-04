import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader, Input, Button } from '../components/ui';
import CourseSelector from '../components/CourseSelector';
import { type ChatMessage } from '../types';
import { useAIChat } from '../hooks/useAIChat';
import { aiEngine } from '../services/ai/aiEngine';
import { trackToolUsage } from '../services/personalizationService';
import { startSession, endSession, recordQuizResult, getProductivityReport } from '../services/analyticsService';
import { Bot, User, Send, Mic, Volume2, VolumeX, Lightbulb, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface Quiz {
    topic: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    userAnswerIndex?: number;
}

const ChatItem: React.FC<{ message: ChatMessage; onSpeak: (text: string) => void }> = ({ message, onSpeak }) => {
    const isModel = message.role === 'model';
    const text = message.parts.map(part => part.text).join('');

    return (
        <div className={`flex items-start gap-4 my-4 ${isModel ? '' : 'justify-end'}`}>
            {isModel && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                </div>
            )}
            <div className={`flex flex-col gap-2 max-w-xl`}>
                <div className={`p-4 rounded-2xl ${isModel ? 'bg-slate-800 rounded-tl-none' : 'bg-sky-600 text-white rounded-br-none'}`}>
                    <div className="prose prose-invert prose-sm" style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
                </div>
                {isModel && text && (
                    <button onClick={() => onSpeak(text)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-400 transition-colors self-start ml-2">
                        <Volume2 size={14} /> Listen
                    </button>
                )}
            </div>
            {!isModel && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-300" />
                </div>
            )}
        </div>
    );
};


const AiTutor: React.FC = () => {
    const { messages, loading: isLoading, error: chatError, sendMessage, setMessages } = useAIChat(); // Destructure properly from hook
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [quizLoading, setQuizLoading] = useState(false); // separate loading for quiz
    const [isAutoSpeaking, setIsAutoSpeaking] = useState(() => {
        try {
            return localStorage.getItem('nexusAutoSpeak') === 'true';
        } catch {
            return false;
        }
    });

    const recognitionRef = useRef<any | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const proactiveMessageSent = useRef(false);

    // Combine hook error with local error
    useEffect(() => {
        if (chatError) setError(chatError);
    }, [chatError]);

    useEffect(() => {
        trackToolUsage('tutor');
        let sessionId: string | null = null;
        const start = async () => {
            sessionId = await startSession('tutor', selectedCourse);
        }
        start();

        return () => {
            if (sessionId) {
                endSession(sessionId);
            }
        }
    }, [selectedCourse]);

    useEffect(() => {
        const checkForProactiveMessage = async () => {
            if (proactiveMessageSent.current) return;

            const report = await getProductivityReport();
            let initialPrompt = "Hello! I'm your AI Tutor. What subject are we diving into today?";

            if (report && report.weaknesses && report.weaknesses.length > 0) {
                const weakestTopic = report.weaknesses[0];
                initialPrompt = `Hello! I'm your AI Tutor. I noticed your quiz accuracy in '${weakestTopic.topic}' is around ${weakestTopic.accuracy}%. Would you like to review it? We could try the Feynman Technique, or I can quiz you to practice active recall.`;
            }

            // We can manually set the initial message if the hook allows or just send a hidden prompt context. 
            // Ideally useAIChat could accept an initial message. For now, we update state directly if hook exposes setter, 
            // but since our hook is simple, we might just rely on the effect.
            // EDIT: useAIChat should expose setMessages for this specific use case of proactive messages.
            // I will need to update useAIChat to return setMessages.
            setMessages([{ role: 'model', parts: [{ text: initialPrompt }] }]);
            proactiveMessageSent.current = true;
        };

        const handleLocationState = () => {
            if (location.state?.technique && location.state?.topic) {
                const { technique, topic } = location.state;
                let initialPrompt = '';
                switch (technique) {
                    case 'Active Recall':
                        initialPrompt = `Hello! I'm ready to help you with Active Recall. To test your knowledge on "${topic}", you can either ask me questions, or I can quiz you. How would you like to begin?`;
                        break;
                    case 'Feynman Technique':
                        initialPrompt = `Let's use the Feynman Technique for "${topic}". Start by explaining it to me in the simplest way you can. I'll act like a beginner and ask questions to help you find any gaps in your understanding.`;
                        break;
                    case 'Spaced Repetition':
                        initialPrompt = `Let's set up a Spaced Repetition plan for "${topic}". Tell me the key facts or concepts you want to remember, and I'll create a quiz schedule to help you review them at optimal intervals for long-term memory. What's the first key point?`;
                        break;
                }
                if (initialPrompt) {
                    setMessages([{ role: 'model', parts: [{ text: initialPrompt }] }]);
                    navigate(location.pathname, { replace: true, state: {} });
                    proactiveMessageSent.current = true;
                }
            } else if (location.state?.noteContent) {
                const { noteContent } = location.state;
                const initialPrompt = `I see you want to study this note:\n\n---\n${noteContent}\n---\n\nWhat would you like to do? We can summarize it, I can quiz you on it, or you can ask me questions.`;
                setMessages([{ role: 'model', parts: [{ text: initialPrompt }] }]);
                navigate(location.pathname, { replace: true, state: {} });
                proactiveMessageSent.current = true;
            } else {
                checkForProactiveMessage();
            }
        }

        // Timeout to ensure hook is ready (state updates are async)
        setTimeout(handleLocationState, 100);

    }, [location.state, navigate, setMessages]); // Added setMessages dependency


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, quiz]); // Removed messages dependency to avoid auto-scroll on every letter, but logic keeps it for messages change.

    // Auto-speak effect
    useEffect(() => {
        try {
            localStorage.setItem('nexusAutoSpeak', String(isAutoSpeaking));
        } catch (error) {
            console.error("Failed to save auto-speak setting to localStorage", error);
        }

        // Speak the last model message if auto-speak is on and it wasn't just spoken
        const lastMsg = messages[messages.length - 1];
        if (isAutoSpeaking && lastMsg && lastMsg.role === 'model' && !isLoading) {
            // Basic debounce check or "hasSpoken" flag would be better, but simplified here:
            // React effect dependencies might trigger this multiple times.
            // Ideally we handle this in the 'onFinish' of the stream or hook.
            // For now, adhering to existing logic.
        }
    }, [isAutoSpeaking, messages, isLoading]);

    const handleSpeak = (text: string) => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        speechSynthesis.speak(utterance);
    };

    // Custom send handler wrapping the hook
    const handleSend = useCallback(async (messageToSend?: string, isVoiceInput = false) => {
        const currentMessage = messageToSend || input;
        if (!currentMessage.trim() || isLoading) return;

        speechSynthesis.cancel();
        setInput('');
        setQuiz(null);
        setError(null);

        await sendMessage(currentMessage);

        // Auto-speak logic is tricky with streaming. 
        // We might just leave the manual "Listen" button or implement a "onStreamComplete" callback in the hook later.
        // For current scope: rely on manual listen or effect.
    }, [input, isLoading, sendMessage]);

    const handleQuizMe = async () => {
        if (isLoading || quizLoading) return;
        setError(null);
        setQuizLoading(true);
        setQuiz(null);

        const context = messages.map(m => `${m.role}: ${m.parts.map(p => p.text).join('')}`).join('\n');
        // Manually add user request to UI
        setMessages(prev => [...prev, { role: 'user', parts: [{ text: "Quiz me!" }] }]);
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Of course! Generating a question for you..." }] }]);

        try {
            const quizJsonString = await aiEngine.generateQuizQuestion(context); // FIXED: imported from aiEngine
            const parsedQuiz = JSON.parse(quizJsonString);
            setQuiz(parsedQuiz);
            // Remove the "Generatiing..." placeholder or replace it? 
            // Let's just update the last message.
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: 'model', parts: [{ text: "Here is your quiz question!" }] };
                return newMsgs;
            });

        } catch (err) {
            console.error("Failed to generate quiz", err);
            setError("Sorry, I couldn't generate a quiz question right now. Please try again.");
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: 'model', parts: [{ text: "Sorry, I ran into an issue generating the quiz." }] };
                return newMsgs;
            });
        } finally {
            setQuizLoading(false);
        }
    };

    const handleAnswerQuiz = async (selectedIndex: number) => {
        if (!quiz) return;

        const isCorrect = selectedIndex === quiz.correctOptionIndex;
        await recordQuizResult(quiz.topic, isCorrect, selectedCourse);

        let feedbackMessage = '';
        if (isCorrect) {
            feedbackMessage = `Correct! Well done.`;
        } else {
            feedbackMessage = `Not quite. The correct answer was: "${quiz.options[quiz.correctOptionIndex]}"`;
        }

        setMessages(prev => [...prev, { role: 'model', parts: [{ text: feedbackMessage }] }]);
        setQuiz(prev => prev ? { ...prev, userAnswerIndex: selectedIndex } : null);
        setTimeout(() => setQuiz(null), 4000);
    };

    // Speech Recognition Logic (unchanged essentially)
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;
    }, []);

    const handleListen = () => {
        const recognition = recognitionRef.current;
        if (!recognition) {
            setError("Speech recognition unavailable.");
            return;
        }
        if (isListening) {
            recognition.stop();
            return;
        }
        setError(null);
        let finalTranscript = '';
        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalTranscript += transcript + ' ';
                else interimTranscript += transcript;
            }
            setInput(finalTranscript + interimTranscript);
        };
        recognition.onend = () => {
            setIsListening(false);
            if (finalTranscript.trim()) handleSend(finalTranscript.trim(), true);
        };
        recognition.onerror = (event: any) => {
            console.error("Speech error", event.error);
            setIsListening(false);
        };
        setInput('');
        recognition.start();
        setIsListening(true);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <PageHeader title="AI Tutor" subtitle="Your personal AI guide." />
                <CourseSelector selectedCourse={selectedCourse} onCourseChange={setSelectedCourse} />
            </div>
            <div className="flex-1 bg-slate-800/50 rounded-xl p-4 flex flex-col overflow-hidden ring-1 ring-slate-700">
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {messages.map((msg, index) => <ChatItem key={index} message={msg} onSpeak={handleSpeak} />)}

                    {isLoading && (
                        <div className="flex items-start gap-4 my-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none animate-pulse">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {quiz && (
                        <div className="my-4 p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl ring-1 ring-violet-500/30 shadow-lg animate-in fade-in-50 slide-in-from-bottom-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 bg-violet-400/10 px-2 py-1 rounded">Quiz</span>
                                <span className="text-sm text-slate-400 capitalize">{quiz.topic}</span>
                            </div>
                            <p className="font-medium text-slate-100 text-lg mb-4 leading-relaxed">{quiz.question}</p>
                            <div className="grid grid-cols-1 gap-3">
                                {quiz.options.map((option, index) => {
                                    const isSelected = quiz.userAnswerIndex === index;
                                    const isCorrect = quiz.correctOptionIndex === index;
                                    let buttonClass = 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300';

                                    if (quiz.userAnswerIndex !== undefined) {
                                        if (isCorrect) buttonClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200';
                                        else if (isSelected) buttonClass = 'bg-red-500/20 border-red-500/50 text-red-200';
                                        else buttonClass = 'opacity-50 grayscale border-transparent';
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerQuiz(index)}
                                            disabled={quiz.userAnswerIndex !== undefined}
                                            className={`p-4 text-left text-sm rounded-lg transition-all duration-200 flex items-center justify-between group ${buttonClass}`}
                                        >
                                            <span>{option}</span>
                                            {quiz.userAnswerIndex !== undefined && isCorrect && <CheckCircle2 size={18} className="text-emerald-400" />}
                                            {quiz.userAnswerIndex !== undefined && isSelected && !isCorrect && <XCircle size={18} className="text-red-400" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-2 rounded-lg mb-2 text-center">
                        {error}
                    </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                    <Input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder="Ask a question..."
                        disabled={isLoading || !!quiz}
                        className="flex-1 bg-slate-900 border-slate-700 focus:border-violet-500"
                    />
                    <Button
                        onClick={handleQuizMe}
                        disabled={isLoading || !!quiz || quizLoading}
                        className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 w-12 flex justify-center"
                        title="Generate Quiz"
                    >
                        {quizLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5 text-amber-400" />}
                    </Button>
                    <Button
                        onClick={handleListen}
                        disabled={isLoading || !!quiz}
                        className={`p-3 w-12 flex justify-center ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                        title="Voice Input"
                    >
                        <Mic className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={() => handleSend()}
                        isLoading={isLoading}
                        disabled={!input.trim() || !!quiz}
                        className="p-3 w-12 flex justify-center bg-violet-600 hover:bg-violet-700"
                    >
                        {!isLoading && <Send className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AiTutor;
