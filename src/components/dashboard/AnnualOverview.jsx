import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronDown } from 'lucide-react';

const AnnualOverview = () => {
    const data = [
        { name: 'Jan', value: 40 }, { name: 'Feb', value: 80 }, { name: 'Mar', value: 60 },
        { name: 'Apr', value: 100 }, { name: 'May', value: 70 }, { name: 'Jun', value: 65 },
        { name: 'Jul', value: 50 }, { name: 'Aug', value: 80 }, { name: 'Sep', value: 80 },
        { name: 'Oct', value: 60 }, { name: 'Nov', value: 100 }, { name: 'Dec', value: 70 },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Annual Overview</h3>
                <button className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Public <ChevronDown size={14} />
                </button>
            </div>

            <div className="flex-1 w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={0} barCategoryGap="20%">
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12, dy: 10 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        {/* Background Bars (Full Height) - Simulated by stacking or max value? 
                             For simplicity, we use one dynamic bar. 
                             The image shows grey background bars for total capacity/max.
                             We can add a <Bar dataKey="max" fill="#f3f4f6" /> but we need to prep data.
                         */}
                        <Bar
                            dataKey="value"
                            radius={[4, 4, 4, 4]}
                            barSize={30}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                            ))}
                        </Bar>
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f97316" />
                                <stop offset="100%" stopColor="#dc2626" />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnnualOverview;
