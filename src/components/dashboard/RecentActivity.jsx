import React from 'react';

const ActivityItem = ({ user, action, target, time, type }) => (
    <div className="flex items-start gap-4 mb-6 last:mb-0">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} alt={user} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 dark:text-gray-200">
                <span className="font-bold">{user}</span> {action} <span className="text-orange-500 font-medium">{target}</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {time}
                </span>
                {type && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${type === 'Grow' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                        type === 'Review' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                            type === 'Member' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {type}
                    </span>
                )}
            </div>
        </div>
    </div>
);

const RecentActivity = () => {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Platform Activity</h3>
                <button className="text-orange-600 text-sm font-bold hover:underline">View All</button>
            </div>

            <div className="space-y-6">
                <ActivityItem
                    user="John Doe"
                    action="placed an order"
                    target="Golden Spice Kitchen"
                    time="2 min ago"
                    type="Grow"
                />
                <ActivityItem
                    user="Sarah Smith"
                    action="reviewed"
                    target="Ocean Breeze Cafe"
                    time="15 min ago"
                    type="Review"
                />
                <ActivityItem
                    user="Mike Johnson"
                    action="became a premium member"
                    target=""
                    time="1 hour ago"
                    type="Member"
                />
                <ActivityItem
                    user="Emma Wilson"
                    action="added to favorites"
                    target="Mountain View Bistro"
                    time="2 hours ago"
                    type="Favorite"
                />
            </div>
        </div>
    );
};

export default RecentActivity;
