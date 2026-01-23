import React from 'react';
import { Clock, AlertCircle, Mail, AlertTriangle, Bell } from 'lucide-react';

const NotificationItem = ({ color, icon: Icon, title, desc, time, type }) => {
    const borderColors = {
        red: 'border-l-red-500',
        green: 'border-l-green-500',
        yellow: 'border-l-yellow-500',
        blue: 'border-l-blue-500'
    };

    const bgColors = {
        red: 'bg-red-50 dark:bg-red-900/10',
        green: 'bg-green-50 dark:bg-green-900/10',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/10',
        blue: 'bg-blue-50 dark:bg-blue-900/10'
    };

    const iconColors = {
        red: 'text-red-500 bg-red-100 dark:bg-red-900/30',
        green: 'text-green-500 bg-green-100 dark:bg-green-900/30',
        yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-500',
        blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30'
    };

    return (
        <div className={`p-3 rounded-xl ${bgColors[color]} mb-3 border-l-4 ${borderColors[color]} dark:bg-opacity-10`}>
            <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full ${iconColors[color]} flex items-center justify-center shrink-0`}>
                    <Icon size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug mb-1">{title}</h4>
                    {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{desc}</p>}
                    <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-[10px] font-medium uppercase tracking-wide">
                        <Clock size={10} />
                        <span>{time}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Notifications = () => {
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h3>
                <button className="text-orange-600 text-sm font-bold hover:underline">View All</button>
            </div>

            <div className="overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
                <NotificationItem
                    color="red"
                    icon={AlertCircle} // Hourglass equivalent
                    title="Restaurant has not responded to an order #ORD-45821 | Spice Villa | Anjali R"
                    time="2 min ago"
                />
                <NotificationItem
                    color="green"
                    icon={Clock}
                    title="System maintenance scheduled for tonight at 2 AM"
                    time="5 min ago"
                />
                <NotificationItem
                    color="red"
                    icon={Mail}
                    title="Problem reported by Rahul S | Unable to complete payment"
                    time="35 min ago"
                />
                <NotificationItem
                    color="yellow"
                    icon={AlertTriangle}
                    title="3 restaurants require license renewal"
                    time="1 hour ago"
                />
                <NotificationItem
                    color="blue"
                    icon={Bell}
                    title="New restaurant application pending approval"
                    time="3 hours ago"
                />
            </div>
        </div>
    );
};

export default Notifications;
