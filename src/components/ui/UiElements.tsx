
import React, { useState } from 'react';
import { Clipboard, Check, X } from 'lucide-react';

// PageHeader Component
interface PageHeaderProps {
    title: string;
    subtitle: string;
}
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => (
    <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">{title}</h1>
        <p className="mt-2 text-slate-400 text-lg">{subtitle}</p>
    </div>
);

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, isLoading, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-900 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
                disabled={isLoading}
                {...props}
            >
                {isLoading ? <Spinner /> : children}
            </button>
        );
    }
);

// Input Component
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={`w-full bg-slate-800 border border-slate-700 rounded-md py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors duration-200 ${className}`}
                {...props}
            />
        );
    }
);

// Textarea Component
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={`w-full bg-slate-800 border border-slate-700 rounded-md py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors duration-200 ${className}`}
                {...props}
            />
        );
    }
);

// Select Component
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className, ...props }, ref) => {
        return (
            <select
                ref={ref}
                className={`w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors duration-200 ${className}`}
                {...props}
            />
        );
    }
);

// Spinner Component
export const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// CodeBlock Component
interface CodeBlockProps {
    code: string;
}
export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Basic cleaning to remove markdown backticks and language identifier
    const cleanedCode = code.replace(/^```(?:\w+\n)?/, '').replace(/```$/, '').trim();

    return (
        <div className="bg-slate-800 rounded-lg my-4 relative">
            <button onClick={handleCopy} className="absolute top-3 right-3 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 transition-colors">
                {copied ? <Check size={16} /> : <Clipboard size={16} />}
            </button>
            <pre className="p-4 overflow-x-auto text-sm text-slate-200 rounded-lg">
                <code className="font-mono">{cleanedCode}</code>
            </pre>
        </div>
    );
};

// Modal Component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 ring-1 ring-slate-700 p-6 transform transition-all duration-300 scale-95 opacity-0 animate-in"
                onClick={(e) => e.stopPropagation()}
                style={{ animationName: 'modal-enter', animationDuration: '0.2s', animationFillMode: 'forwards' }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id="modal-title" className="text-xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
            <style>{`
                @keyframes modal-enter {
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

// Card Component
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
    <div className={`bg-slate-800 rounded-lg shadow ring-1 ring-slate-700/50 ${className}`} {...props}>
        {children}
    </div>
);

// Skeleton Component for Loading States
interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'card' | 'circle';
    width?: string;
    height?: string;
}
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'text', width, height }) => {
    const baseClasses = 'animate-pulse bg-slate-700/50 rounded';
    const variantClasses = {
        text: 'h-4 rounded',
        card: 'rounded-lg',
        circle: 'rounded-full'
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{ width, height }}
        />
    );
};

// Dashboard Skeleton - Complete loading state for dashboards
export const DashboardSkeleton: React.FC = () => (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 animate-in fade-in duration-300">
        {/* Header Skeleton */}
        <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-slate-800 rounded-lg p-4 ring-1 ring-slate-700/50">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-12" />
                </div>
            ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-800 rounded-lg p-5 ring-1 ring-slate-700/50">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 p-3 bg-slate-900/50 rounded-lg">
                                <Skeleton variant="circle" className="w-10 h-10" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="bg-slate-800 rounded-lg p-5 ring-1 ring-slate-700/50">
                    <Skeleton className="h-5 w-24 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Toast Notification Component
interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    isVisible: boolean;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', isVisible, onClose }) => {
    React.useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const bgColors = {
        success: 'bg-emerald-600',
        error: 'bg-red-600',
        info: 'bg-violet-600'
    };

    const icons = {
        success: <Check size={20} />,
        error: <X size={20} />,
        info: <span className="text-lg">ℹ️</span>
    };

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
            <div className={`${bgColors[type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-lg`}>
                <span className="flex-shrink-0">{icons[type]}</span>
                <p className="flex-1 text-sm font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

// Toast Context for global toast notifications
interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
        message: '',
        type: 'info',
        visible: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type, visible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={hideToast}
            />
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = React.useContext(ToastContext);
    if (!context) {
        // Fallback for when used outside provider
        return {
            showToast: (message: string, type?: 'success' | 'error' | 'info') => {
                console.log(`Toast (${type}): ${message}`);
            }
        };
    }
    return context;
};


