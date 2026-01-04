import React from 'react';
import { Trophy, Flame, ArrowRight } from 'lucide-react';

interface ChallengeWidgetProps {
    topic: string;
    xpReward: number;
    onAccept: () => void;
}

export const ChallengeWidget: React.FC<ChallengeWidgetProps> = ({ topic, xpReward, onAccept }) => {
    return (
        <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl transition-all group-hover:bg-amber-500/20"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Pro Challenge</h3>
                            <p className="text-amber-200 text-sm">You're crushing {topic}!</p>
                        </div>
                    </div>
                    <div className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm font-bold border border-amber-500/20 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> +{xpReward} XP
                    </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 mb-6 border border-amber-500/10">
                    <p className="text-gray-300 text-sm mb-2">Beat the AI's hardest questions on <span className="text-white font-medium">{topic}</span> to unlock the Master Badge.</p>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-amber-500 h-full w-2/3"></div>
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-1">Top 5% of students</p>
                </div>

                <button
                    onClick={onAccept}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-900/50 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                    Accept Challenge <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
