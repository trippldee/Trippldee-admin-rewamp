
import React, { useState } from 'react';
import { Clock, AlertCircle, Mail, AlertTriangle, Bell, Filter, Search, CheckCircle, Info, ArrowLeft } from 'lucide-react';

const AllNotifications = ({ onBack }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const notifications = [
        {
            id: 1,
            color: 'red',
            icon: AlertCircle,
            title: "Restaurant has not responded to an order #ORD-45821 | Spice Villa | Anjali R",
            desc: "Order has been pending for over 15 minutes.",
            time: "2 min ago",
            type: "alert"
        },
        {
            id: 2,
            color: 'green',
            icon: Clock,
            title: "System maintenance scheduled for tonight at 2 AM",
            desc: "Expected downtime is 30 minutes.",
            time: "5 min ago",
            type: "info"
        },
        {
            id: 3,
            color: 'red',
            icon: Mail,
            title: "Problem reported by Rahul S | Unable to complete payment",
            desc: "Transaction ID: TXN-998877 failed multiple times.",
            time: "35 min ago",
            type: "alert"
        },
        {
            id: 4,
            color: 'yellow',
            icon: AlertTriangle,
            title: "3 restaurants require license renewal",
            desc: "Golden Dragon, Spice Garden, and Tasty Bites.",
            time: "1 hour ago",
            type: "warning"
        },
        {
            id: 5,
            color: 'blue',
            icon: Bell,
            title: "New restaurant application pending approval",
            desc: "Curry House applied for vendor status.",
            time: "3 hours ago",
            type: "info"
        },
        {
            id: 6,
            color: 'green',
            icon: CheckCircle,
            title: "Payment Gateway Restored",
            desc: "Services are back to normal.",
            time: "5 hours ago",
            type: "success"
        },
        {
            id: 7,
            color: 'blue',
            icon: Info,
            title: "New Feature Alert: Dark Mode",
            desc: "You can now toggle dark mode in settings.",
            time: "1 day ago",
            type: "info"
        }
    ];

    const filteredNotifications = notifications.filter(note => {
        const matchesFilter = filter === 'all' || note.type === filter;
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.desc.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                        title="Go Back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Bell className="text-orange-600" size={28} />
                            All Notifications
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage all your system notifications.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:text-white"
                        />
                    </div>
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('alert')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'alert' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`}
                        >
                            Alerts
                        </button>
                        <button
                            onClick={() => setFilter('warning')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'warning' ? 'bg-white dark:bg-slate-700 shadow-sm text-yellow-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`}
                        >
                            Warnings
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {filteredNotifications.length > 0 ? (
                    <div className="space-y-4">
                        {filteredNotifications.map((note) => {
                            const Icon = note.icon;
                            return (
                                <div key={note.id} className={`p-4 rounded-xl ${bgColors[note.color]} border-l-4 ${borderColors[note.color]} dark:bg-opacity-10 transition-transform hover:scale-[1.01] duration-200`}>
                                    <div className="flex gap-4 items-start">
                                        <div className={`w-12 h-12 rounded-full ${iconColors[note.color]} flex items-center justify-center shrink-0`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug mb-1">{note.title}</h4>
                                                <span className="text-xs font-semibold px-2 py-1 bg-white/50 dark:bg-slate-800/50 rounded-lg text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {note.time}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{note.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <Bell size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No notifications found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllNotifications;
