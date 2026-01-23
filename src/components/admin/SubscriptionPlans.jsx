import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    CreditCard,
    Server,
    Building2,
    Calendar,
    CheckCircle,
    DollarSign,
    ShieldCheck,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const SubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });

    const fetchPlans = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get('https://test.trippldee.com/next/api/admin-eatery-subscription/list-subscription-plan', {
                params: { page },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status) {
                setPlans(response.data.data);
                if (response.data.meta) {
                    setPagination({
                        current_page: response.data.meta.current_page,
                        last_page: response.data.meta.last_page,
                        total: response.data.meta.total,
                        per_page: response.data.meta.per_page
                    });
                }
            } else {
                toast.error(response.data.message || 'Failed to fetch subscription plans');
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error('Error loading subscription plans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans(1);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchPlans(newPage);
        }
    };

    const PlanCard = ({ planKey, price, name, expiry }) => (
        <div className={`flex-1 p-4 rounded-xl border ${planKey === 'year'
            ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-800'
            : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-800'
            }`}>
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${planKey === 'year'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                    }`}>
                    {planKey === 'year' ? 'Yearly' : 'Monthly'}
                </span>
                {planKey === 'year' && <ShieldCheck size={18} className="text-purple-500" />}
            </div>

            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{name}</h4>
            <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{price}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={14} />
                <span>Expires in: <strong>{expiry}</strong> {planKey === 'year' ? 'Year' : 'Months'}</span>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300">
            {/* Header */}
            <div className="p-6 border-b dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="text-orange-600" size={24} />
                    Subscription Plans
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage and view available subscription tiers for different organizations.
                </p>
            </div>

            {/* List */}
            <div className="p-6">
                {loading && plans.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 dark:text-gray-400 animate-pulse">
                        Loading plans...
                    </div>
                ) : plans.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                        No subscription plans found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {plans.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all dark:bg-slate-800 dark:border-gray-700"
                            >
                                {/* Card Header */}
                                <div className="px-6 py-4 border-b bg-gray-50 dark:bg-slate-800/80 dark:border-gray-700 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-slate-700 dark:border-gray-600">
                                            <Building2 size={20} className="text-gray-600 dark:text-gray-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{item.organization_alias}</h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Server size={12} className={item.server_environment === 'production' ? 'text-green-500' : 'text-amber-500'} />
                                                <span className={`text-xs font-medium uppercase ${item.server_environment === 'production' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                    {item.server_environment}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono">ID: {item.id}</div>
                                </div>

                                {/* Plan Details */}
                                <div className="p-6 flex flex-col sm:flex-row gap-4">
                                    {/* Monthly Plan */}
                                    {item.plans?.month && (
                                        <PlanCard
                                            planKey="month"
                                            price={item.plans.month}
                                            name={item.plans_name?.month || 'Monthly'}
                                            expiry={item.plans_expiry?.month}
                                        />
                                    )}

                                    {/* Yearly Plan */}
                                    {item.plans?.year && (
                                        <PlanCard
                                            planKey="year"
                                            price={item.plans.year}
                                            name={item.plans_name?.year || 'Yearly'}
                                            expiry={item.plans_expiry?.year}
                                        />
                                    )}
                                </div>

                                <div className="px-6 py-3 bg-gray-50 border-t dark:bg-slate-800/50 dark:border-gray-700 text-xs text-center text-gray-400">
                                    Last Info Update: {item.updated_at}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t dark:border-gray-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> to <span className="font-medium">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Page {pagination.current_page} of {pagination.last_page}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionPlans;
