import React from 'react';
import { Target, Clock, CheckCircle } from 'lucide-react';

interface FocusCoachProps {
    recommendedTask: string;
    durationMins: number;
    onStart: () => void;
}

export const FocusCoachWidget: React.FC<FocusCoachProps> = ({ recommendedTask, durationMins, onStart }) => {
    return (
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/20"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Target className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Focus Coach</h3>
                        <p className="text-indigo-200 text-sm">Let's simplify. Just one goal.</p>
                    </div>
                </div>

                <div className="bg-black/20 rounded-xl p-5 mb-6 border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">Recommended for You</span>
                        <span className="flex items-center text-xs text-indigo-300 gap-1 bg-indigo-500/10 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" /> {durationMins} min
                        </span>
                    </div>
                    <p className="text-lg text-white font-medium leading-relaxed">
                        "{recommendedTask}"
                    </p>
                </div>

                <button
                    onClick={onStart}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" />
                    Start Focus Session
                </button>
            </div>
        </div>
    );
};
