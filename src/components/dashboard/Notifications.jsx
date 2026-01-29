import React, { useState } from 'react';
import { Clock, AlertCircle, Mail, AlertTriangle, Bell, Plus, X, Send } from 'lucide-react';

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

const CreateNotificationModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 opacity-100 border border-gray-100 dark:border-gray-800">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell size={20} className="text-orange-600" />
                        Create Notification
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body (Dummy UI) */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input
                            type="text"
                            placeholder="Notification title..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                        <textarea
                            placeholder="Enter notification details..."
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all appearance-none cursor-pointer">
                                <option>General Info</option>
                                <option>Warning / Alert</option>
                                <option>Success</option>
                                <option>System Update</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audience</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all appearance-none cursor-pointer">
                                <option>All Users</option>
                                <option>Restaurants Only</option>
                                <option>Customers Only</option>
                                <option>Admins</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                        <AlertCircle size={16} className="shrink-0" />
                        <p>This notification will be sent immediately to the selected audience.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 dark:bg-slate-800/50 dark:border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20 flex items-center gap-2"
                    >
                        <Send size={16} />
                        Send Notification
                    </button>
                </div>
            </div>
        </div>
    );
}

const Notifications = ({ onViewAll }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h3>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors dark:hover:bg-orange-900/20"
                        title="Add Notification"
                    >
                        <Plus size={20} />
                    </button>
                    <button
                        onClick={onViewAll}
                        className="text-orange-600 text-sm font-bold hover:underline"
                    >
                        View All
                    </button>
                </div>
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

            <CreateNotificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Notifications;
