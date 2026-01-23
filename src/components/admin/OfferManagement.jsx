import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Tag,
    Store,
    Calendar,
    Search,
    ChevronLeft,
    ChevronRight,
    Percent,
    DollarSign,
    CheckCircle,
    XCircle,
    Info,
    Clock
} from 'lucide-react';

const OfferManagement = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchOffers = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get('https://test.trippldee.com/next/api/admin-eatery-offers/list-all', {
                params: { page },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status) {
                setOffers(response.data.data);
                if (response.data.meta) {
                    setPagination({
                        current_page: response.data.meta.current_page,
                        last_page: response.data.meta.last_page,
                        total: response.data.meta.total,
                        per_page: response.data.meta.per_page
                    });
                }
            } else {
                toast.error(response.data.message || 'Failed to fetch offers');
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            toast.error('Error loading offers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers(1);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchOffers(newPage);
        }
    };

    const handleViewDetails = (offer) => {
        setSelectedOffer(offer);
        setIsDetailsModalOpen(true);
    };

    // Filter offers based on search query (client-side filtering as API might not support it yet, or add param if supported)
    // For now assuming client side or just display all
    const filteredOffers = offers.filter(offer =>
        offer.offer_label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.eatery_alias?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.display_label?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
            case 'expired': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
            default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300">
            {/* Header */}
            <div className="p-6 border-b dark:border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Tag className="text-orange-600" size={24} />
                        Eatery Offers
                    </h2>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search offers or eateries..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:bg-slate-800 dark:border-gray-700 dark:text-gray-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="p-6">
                {loading ? (
                    <div className="py-12 text-center text-gray-500 dark:text-gray-400 animate-pulse">
                        Loading offers...
                    </div>
                ) : filteredOffers.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'No offers match your search.' : 'No offers found.'}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredOffers.map((offer) => (
                            <div
                                key={offer.id}
                                onClick={() => handleViewDetails(offer)}
                                className="group relative bg-white border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer dark:bg-slate-800 dark:border-gray-700 dark:hover:border-orange-500/30"
                            >
                                {/* Left Icon/Status Section */}
                                <div className="flex items-center justify-between md:justify-center md:flex-col gap-2 md:w-24 md:border-r md:pr-4 dark:border-gray-700">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${offer.offer_type === 'percentage' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                                        {offer.offer_type === 'percentage' ? <Percent size={20} /> : <DollarSign size={20} />}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(offer.status)}`}>
                                        {offer.status}
                                    </span>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50">
                                                {offer.offer_label}
                                            </span>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                {offer.display_label}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <Store size={14} />
                                            Eatery: <span className="font-medium text-gray-700 dark:text-gray-300">{offer.eatery_alias}</span>
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">Value</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {offer.offer_type === 'fixed' ? '₹' : ''}{offer.offer_value}{offer.offer_type === 'percentage' ? '%' : ''} OFF
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">Min. Order</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                ₹{offer.minimum_order_amount}
                                            </p>
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1">
                                                <Calendar size={12} /> Validity
                                            </p>
                                            <p className="text-gray-700 dark:text-gray-300 text-xs">
                                                {offer.start_date.split(' ')[0]} - {offer.expires_at.split(' ')[0]}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Chevron for affordance */}
                                <div className="hidden md:flex items-center justify-center pl-4 border-l dark:border-gray-700">
                                    <ChevronRight className="text-gray-300 group-hover:text-orange-500 transition-colors" size={24} />
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

            {/* Details Modal */}
            {isDetailsModalOpen && selectedOffer && (
                <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col dark:bg-slate-900 dark:border dark:border-gray-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Info size={20} className="text-orange-600" />
                                Offer Details
                            </h3>
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Main Info Card */}
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30 text-center">
                                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1 block">Display Label</span>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedOffer.display_label}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{selectedOffer.offer_label}</p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg dark:bg-slate-800 border border-gray-100 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Eatery Alias</span>
                                    <span className="font-mono font-medium text-gray-900 dark:text-white">{selectedOffer.eatery_alias}</span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg dark:bg-slate-800 border border-gray-100 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Offer Status</span>
                                    <span className={`inline-flex items-center gap-1 font-medium ${selectedOffer.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedOffer.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {selectedOffer.status}
                                    </span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg dark:bg-slate-800 border border-gray-100 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Value</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {selectedOffer.offer_type === 'fixed' ? '₹' : ''}{selectedOffer.offer_value}{selectedOffer.offer_type === 'percentage' ? '%' : ''}
                                    </span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg dark:bg-slate-800 border border-gray-100 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Min Order</span>
                                    <span className="font-bold text-gray-900 dark:text-white">₹{selectedOffer.minimum_order_amount}</span>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between text-sm p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Clock size={16} />
                                        <span>Start Date</span>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">{selectedOffer.start_date}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Clock size={16} />
                                        <span>Expires At</span>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">{selectedOffer.expires_at}</span>
                                </div>
                            </div>

                            <div className="pt-2 text-xs text-center text-gray-400">
                                Created: {selectedOffer.created_at} • Last Updated: {selectedOffer.updated_at}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 dark:bg-slate-800/50 dark:border-gray-800">
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferManagement;
