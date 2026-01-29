
import React, { useState } from 'react';
import { ArrowLeft, Clock, Search, Filter, Activity, User, Star, ShoppingBag, Heart } from 'lucide-react';

const AllActivity = ({ onBack }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const activities = [
        { id: 1, user: "John Doe", action: "placed an order", target: "Golden Spice Kitchen", time: "2 min ago", type: "Order", avatar_seed: "John Doe" },
        { id: 2, user: "Sarah Smith", action: "reviewed", target: "Ocean Breeze Cafe", time: "15 min ago", type: "Review", avatar_seed: "Sarah Smith" },
        { id: 3, user: "Mike Johnson", action: "became a premium member", target: "", time: "1 hour ago", type: "Member", avatar_seed: "Mike Johnson" },
        { id: 4, user: "Emma Wilson", action: "added to favorites", target: "Mountain View Bistro", time: "2 hours ago", type: "Favorite", avatar_seed: "Emma Wilson" },
        { id: 5, user: "Alex Turner", action: "updated profile", target: "", time: "3 hours ago", type: "Profile", avatar_seed: "Alex Turner" },
        { id: 6, user: "Lisa Wong", action: "redeemed a coupon", target: "SAVE20", time: "4 hours ago", type: "Redeem", avatar_seed: "Lisa Wong" },
        { id: 7, user: "David Brown", action: "cancelled order", target: "#ORD-9921", time: "5 hours ago", type: "Order", avatar_seed: "David Brown" },
        { id: 8, user: "Sophie Lee", action: "posted a photo", target: "Burger House", time: "Yesterday", type: "Post", avatar_seed: "Sophie Lee" },
        { id: 9, user: "Ryan Ray", action: "placed an order", target: "Pizza Hut", time: "Yesterday", type: "Order", avatar_seed: "Ryan Ray" },
    ];

    const filteredActivities = activities.filter(act => {
        const matchesFilter = filter === 'all' || act.type === filter;
        const searchString = `${act.user} ${act.action} ${act.target}`.toLowerCase();
        const matchesSearch = searchString.includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Order': return <ShoppingBag size={14} className="text-orange-500" />;
            case 'Review': return <Star size={14} className="text-yellow-500" />;
            case 'Favorite': return <Heart size={14} className="text-red-500" />;
            case 'Member': return <User size={14} className="text-purple-500" />;
            default: return <Activity size={14} className="text-blue-500" />;
        }
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
                            <Activity className="text-orange-600" size={28} />
                            Platform Activity
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Live feed of user actions and system events.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search activity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:text-white"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:text-white appearance-none cursor-pointer"
                    >
                        <option value="all">All Activity</option>
                        <option value="Order">Orders</option>
                        <option value="Review">Reviews</option>
                        <option value="Member">Members</option>
                        <option value="Favorite">Favorites</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {filteredActivities.length > 0 ? (
                    <div className="relative border-l border-gray-200 dark:border-gray-800 ml-4 space-y-8">
                        {filteredActivities.map((act) => (
                            <div key={act.id} className="relative pl-8 group">
                                {/* Timeline Dot */}
                                <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${act.type === 'Order' ? 'bg-orange-500' :
                                        act.type === 'Review' ? 'bg-yellow-500' :
                                            act.type === 'Member' ? 'bg-purple-500' :
                                                act.type === 'Favorite' ? 'bg-red-500' : 'bg-blue-500'
                                    }`}></span>

                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0 shadow-sm">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${act.avatar_seed}`} alt={act.user} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="text-base text-gray-800 dark:text-gray-200">
                                                <span className="font-bold">{act.user}</span> {act.action} <span className="text-orange-600 font-semibold">{act.target}</span>
                                            </p>
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{act.time}</span>
                                        </div>

                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${act.type === 'Order' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    act.type === 'Review' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        act.type === 'Member' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                            act.type === 'Favorite' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {getTypeIcon(act.type)}
                                                {act.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <Activity size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No activity found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllActivity;
