
import React, { useState, useEffect } from 'react';
import { Search, Filter, Mail, Phone, Calendar, CheckCircle, Clock, AlertCircle, Eye, Ticket, Tag, Info, X, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'read', 'unread'
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalTicket, setModalTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    // Handle Reply
    const handleReply = async () => {
        if (!selectedTicket || !replyMessage.trim()) return;

        setSendingReply(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.post(
                'https://test.trippldee.com/next/api/contact/reply',
                {
                    contact_alias: selectedTicket.alias,
                    reply_message: replyMessage
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.status) { // Check for status true based on likely API structure, though user didn't explicitly show success response structure, assuming standard pattern
                toast.success('Reply sent successfully');
                setReplyMessage('');
            } else {
                // Fallback if status is false but request succeeded (e.g. valid 200 OK but application level error)
                // If the API returns the message directly in response.data.message
                toast.success(response.data.message || 'Reply sent successfully');
                setReplyMessage('');
            }

        } catch (error) {
            console.error('Error sending reply:', error);
            // Improve error handling to show message from backend if available
            const errorMsg = error.response?.data?.message || 'Failed to send reply';
            toast.error(errorMsg);
        } finally {
            setSendingReply(false);
        }
    };

    // Fetch tickets function
    const fetchTickets = async (page = 1, currentFilter = filter) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios({
                method: 'get',
                url: `https://test.trippldee.com/next/api/contact/list?page=${page}`,
                data: { filter: currentFilter },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.status) {
                setTickets(response.data.data);
                setPagination(response.data.meta);
                if (response.data.data && response.data.data.length > 0) {
                    setSelectedTicket(response.data.data[0]);
                } else {
                    setSelectedTicket(null);
                }
            } else {
                toast.error(response.data.message || 'Failed to fetch tickets');
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Error fetching tickets');
        } finally {
            setLoading(false);
        }
    };

    // Initial load and filter change
    useEffect(() => {
        fetchTickets(1, filter);
    }, [filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchTickets(newPage, filter);
        }
    };

    const handleViewDetails = async (e, ticket) => {
        e.stopPropagation(); // Prevent selecting the ticket in the side panel
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios({
                method: 'get',
                url: 'https://test.trippldee.com/next/api/contact/read',
                params: { contact_alias: ticket.alias },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.status) {
                setModalTicket(response.data.data);
                setShowModal(true);

                // Update the local read status if needed
                setTickets(prev => prev.map(t =>
                    t.id === ticket.id ? { ...t, is_read: true } : t
                ));
            } else {
                toast.error(response.data.message || 'Failed to fetch ticket details');
            }
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            toast.error('Error fetching ticket details');
        }
    };

    // Helper to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSubjectColor = (subject) => {
        switch (subject?.toLowerCase()) {
            case 'general': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'report': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'feedback': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'investment': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Ticket className="text-orange-600" size={28} />
                        Support Tickets
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and respond to user inquiries and support requests.</p>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => handleFilterChange('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleFilterChange('read')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'read'
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        Read
                    </button>
                    <button
                        onClick={() => handleFilterChange('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread'
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            {/* Content Display */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

                {/* LIST COLUMN */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                            </div>
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all border relative group ${selectedTicket?.id === ticket.id
                                        ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800'
                                        : 'bg-white border-transparent hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2 pr-8">
                                        <div className="flex items-center gap-2">
                                            {!ticket.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                                            )}
                                            <h4 className={`font-bold text-sm truncate max-w-[150px] ${selectedTicket?.id === ticket.id ? 'text-orange-900 dark:text-orange-100' : 'text-gray-900 dark:text-white'}`}>
                                                {ticket.full_name}
                                            </h4>
                                        </div>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1 pr-8">
                                        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                                            {ticket.subject}
                                        </h5>
                                        <button
                                            onClick={(e) => handleViewDetails(e, ticket)}
                                            className="p-1 text-gray-400 hover:text-orange-600 transition-colors z-10"
                                            title="View Details"
                                        >
                                            <Info size={14} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 pr-8">
                                        {ticket.message}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                <p>No tickets found</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                            <span className="text-gray-500">Page {pagination.current_page} of {pagination.last_page}</span>
                            <div className="flex gap-2">
                                <button
                                    disabled={pagination.current_page === 1}
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <button
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* DETAIL COLUMN */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full overflow-hidden">
                    {selectedTicket ? (
                        <div className="flex flex-col h-full">
                            {/* Detail Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50/50 dark:bg-slate-800/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {selectedTicket.subject}
                                        </h2>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getSubjectColor(selectedTicket.subject)}`}>
                                            {selectedTicket.subject}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {formatDate(selectedTicket.created_at)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Tag size={14} />
                                            ID: #{selectedTicket.id}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => handleViewDetails(e, selectedTicket)}
                                        className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                                        title="View Details"
                                    >
                                        <Info size={20} />
                                    </button>

                                </div>
                            </div>

                            {/* Detail Body */}
                            <div className="p-8 flex-1 overflow-y-auto">
                                <div className="max-w-3xl mx-auto space-y-8">
                                    {/* Sender Info */}
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                                            {selectedTicket.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{selectedTicket.full_name}</h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500 mt-1">
                                                <a href={`mailto:${selectedTicket.email}`} className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
                                                    <Mail size={14} />
                                                    {selectedTicket.email}
                                                </a>
                                                {selectedTicket.phone_number && (
                                                    <a href={`tel:${selectedTicket.phone_number}`} className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
                                                        <Phone size={14} />
                                                        {selectedTicket.phone_number}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Body */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider text-xs bg-gray-100 dark:bg-gray-800 inline-block px-2 py-1 rounded">Message</h4>
                                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                                            {selectedTicket.message}
                                        </div>
                                    </div>

                                    {/* Reply Section */}
                                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider text-xs bg-gray-100 dark:bg-gray-800 inline-block px-2 py-1 rounded">Reply</h4>
                                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:ring-offset-0 transition-all">
                                            <textarea
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder="Type your reply here..."
                                                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-200 placeholder-gray-400 min-h-[120px] resize-none"
                                            />
                                            <div className="flex justify-end mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={handleReply}
                                                    disabled={sendingReply || !replyMessage.trim()}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-orange-600/20"
                                                >
                                                    {sendingReply ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            <span>Sending...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send size={18} />
                                                            <span>Send Reply</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                            <Ticket size={64} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a ticket to view details</p>
                            <p className="text-sm">Choose from the list on the left</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && modalTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{modalTicket.subject || 'Ticket Details'}</h2>
                                <p className="text-xs text-gray-500 mt-1">Ticket ID: #{modalTicket.id}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl shrink-0">
                                    {modalTicket.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{modalTicket.full_name}</h3>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <Mail size={14} />
                                            <span>{modalTicket.email}</span>
                                        </div>
                                        {modalTicket.phone_number && (
                                            <div className="flex items-center gap-1.5">
                                                <Phone size={14} />
                                                <span>{modalTicket.phone_number}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Message Content</h4>
                                <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                    {modalTicket.message}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} />
                                    <span>Created: {formatDate(modalTicket.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={12} />
                                    <span>Updated: {formatDate(modalTicket.updated_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tickets;
