import React from 'react';
import { User, Utensils, CheckCircle } from 'lucide-react';

const QuickInfo = () => {
    const items = [
        { label: 'Total Users', value: '24,847', icon: User, color: 'from-orange-500 to-red-600' },
        { label: 'Eaterys', value: '4,847', icon: Utensils, color: 'from-orange-500 to-red-600' },
        { label: 'Public Users', value: '14,847', icon: User, color: 'from-red-600 to-red-700' },
        { label: 'Active Orders', value: '847', icon: CheckCircle, color: 'from-red-600 to-red-700' }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-white">Quick Info</h3>
            <div className="grid grid-cols-2 gap-4 flex-1 content-center">
                {items.map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-center">
                        <div
                            className={`w-28 h-28 xl:w-32 xl:h-32 rounded-full bg-gradient-to-b ${item.color} flex flex-col items-center justify-center text-white shadow-xl shadow-orange-500/20 transition-transform hover:scale-105 cursor-default relative overflow-hidden`}
                        >
                            {/* Glass shine effect */}
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 blur-sm rounded-t-full"></div>

                            <item.icon size={28} className="mb-1 opacity-90 relative z-10" strokeWidth={2.5} />
                            <span className="text-xl xl:text-2xl font-bold tracking-tight relative z-10">{item.value}</span>
                            <span className="text-[10px] xl:text-xs font-medium opacity-90 uppercase relative z-10">{item.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickInfo;
