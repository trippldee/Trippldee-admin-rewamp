import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    FileText,
    AlertOctagon,
    Ban,
    Eye,
    ChevronLeft,
    ChevronRight,
    Search,
    MessageSquare,
    Share2,
    ThumbsUp,
    ShieldAlert
} from 'lucide-react';

const PostManagement = () => {
    const [activeTab, setActiveTab] = useState('reported'); // 'reported' | 'blocked'
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });
    const [selectedPost, setSelectedPost] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Helpers to extract alias
    const getAliasFromUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('alias');
        } catch (e) {
            return null;
        }
    };

    const fetchPosts = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const endpoint = activeTab === 'reported'
                ? `https://test.trippldee.com/next/api/admin/list-reported-posts`
                : `https://test.trippldee.com/next/api/admin/get-blocked-posts`;

            const response = await axios.get(endpoint, {
                params: { page },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status || response.data.success) {
                setPosts(response.data.data);
                if (response.data.meta) {
                    setPagination({
                        current_page: response.data.meta.current_page,
                        last_page: response.data.meta.last_page,
                        total: response.data.meta.total,
                        per_page: response.data.meta.per_page
                    });
                }
            } else {
                toast.error(response.data.message || 'Failed to fetch posts');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Error loading posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(1);
    }, [activeTab]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchPosts(newPage);
        }
    };

    const handleViewDetails = (post) => {
        setSelectedPost(post);
        setIsDetailsModalOpen(true);
    };

    const handleBlockToggle = async (post, isBlocking) => {
        // We need an alias. Try to find it.
        let alias = post.alias || post.post_alias;
        if (!alias && post.post_view_url) {
            alias = getAliasFromUrl(post.post_view_url);
        }

        if (!alias) {
            toast.error('Could not find post alias');
            return;
        }

        const confirmMsg = isBlocking
            ? "Are you sure you want to block this post?"
            : "Are you sure you want to unblock this post?";

        if (!window.confirm(confirmMsg)) return;

        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.post('https://test.trippldee.com/next/api/admin/toggle-block-post',
                { post_alias: alias },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success || response.data.status) {
                toast.success(response.data.message || 'Post status updated');
                fetchPosts(pagination.current_page);
                setIsDetailsModalOpen(false);
            } else {
                toast.error(response.data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error toggling block status:', error);
            toast.error('Error updating post status');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300">
            {/* Tabs Header */}
            <div className="border-b px-6 pt-6 flex gap-8 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('reported')}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'reported'
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    Reported Posts
                    {activeTab === 'reported' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('blocked')}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'blocked'
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    Blocked Posts
                    {activeTab === 'blocked' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                    )}
                </button>
            </div>

            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {activeTab === 'reported' ? <AlertOctagon className="text-red-600" size={20} /> : <Ban className="text-red-600" size={20} />}
                        {activeTab === 'reported' ? 'Reported Content' : 'Blocked Content'}
                    </h2>
                </div>

                <div className="flex flex-col gap-4">
                    {loading && posts.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            Loading posts...
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            No posts found.
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => handleViewDetails(post)}
                                className="group relative bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-all cursor-pointer dark:bg-slate-800 dark:border-gray-700"
                            >
                                {/* Image Preview (Thumbnail) */}
                                <div className="hidden sm:block w-32 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden dark:bg-slate-700">
                                    {post.images && post.images.length > 0 ? (
                                        <img
                                            src={post.images[0].url}
                                            alt="Post content"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <FileText size={24} opacity={0.5} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    {/* Top Row: User & Meta */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-xs font-bold text-orange-600 dark:from-orange-900 dark:to-red-900 dark:text-orange-200">
                                                {post.user_referral_code?.slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">User: {post.user_referral_code}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{post.created_at}</p>
                                            </div>
                                        </div>
                                        {activeTab === 'reported' && (
                                            <span className="flex-shrink-0 px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-md border border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 flex items-center gap-1">
                                                <ShieldAlert size={12} />
                                                <span className="hidden sm:inline">Reports:</span> {post.reports_count}
                                            </span>
                                        )}
                                    </div>

                                    {/* Middle: Text */}
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                                        {post.content || <span className="italic text-gray-400">No text content</span>}
                                    </p>

                                    {/* Bottom: Stats & Tags */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
                                        <div className="flex gap-4">
                                            <span className="flex items-center gap-1"><ThumbsUp size={14} /> {post.likes_count}</span>
                                            <span className="flex items-center gap-1"><Eye size={14} /> {post.view_count}</span>
                                            <span className="flex items-center gap-1"><Share2 size={14} /> {post.share_count}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded-full border text-[10px] ${post.privacy?.alias === 'public'
                                                ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                                : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-800 dark:border-gray-600'
                                                }`}>
                                                {post.privacy?.name || 'Public'}
                                            </span>

                                            {/* Action Buttons (Stop Propagation) */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBlockToggle(post, activeTab === 'reported');
                                                }}
                                                className={`p-2 rounded-lg transition-colors border ${activeTab === 'reported'
                                                    ? 'text-red-600 border-red-100 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20'
                                                    : 'text-green-600 border-green-100 hover:bg-green-50 dark:border-green-900/30 dark:hover:bg-green-900/20'}`}
                                                title={activeTab === 'reported' ? "Block Post" : "Unblock Post"}
                                            >
                                                {activeTab === 'reported' ? <Ban size={18} /> : <ThumbsUp size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {posts.length > 0 && (
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
            {isDetailsModalOpen && selectedPost && (
                <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] dark:bg-slate-900 dark:border dark:border-gray-800">
                        <div className="p-6 border-b flex justify-between items-center dark:border-gray-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Post Details</h3>
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <ShieldAlert size={24} className="rotate-45" /> {/* Close icon visual placeholder using existing import if needed or generic x */}
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {/* User Info */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 dark:bg-slate-800 dark:text-gray-300">
                                    {selectedPost.user_referral_code?.slice(0, 2)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">User Code: {selectedPost.user_referral_code}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Created At: {selectedPost.created_at}</p>
                                </div>
                            </div>

                            {/* Content Preview */}
                            <div className="space-y-4 mb-6">
                                <p className="text-gray-800 dark:text-gray-200 text-lg">{selectedPost.content}</p>

                                {selectedPost.images && selectedPost.images.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedPost.images.map(img => (
                                            <img key={img.id} src={img.url} alt="Post attachment" className="rounded-lg w-full h-48 object-cover" />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Reports Section */}
                            {activeTab === 'reported' && selectedPost.reported_users && (
                                <div className="bg-red-50 rounded-xl p-4 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
                                    <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2 dark:text-red-400">
                                        <ShieldAlert size={18} />
                                        Report History ({selectedPost.reports_count})
                                    </h4>
                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                        {selectedPost.reported_users.map((report, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-lg border border-red-100 text-sm shadow-sm dark:bg-slate-800 dark:border-red-900/30">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{report.referral_code}</span>
                                                    <span className="text-xs text-gray-400">{report.reported_at}</span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 italic">"{report.reason}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 dark:bg-slate-800/50 dark:border-gray-800">
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleBlockToggle(selectedPost, activeTab === 'reported')}
                                className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-lg transition-colors flex items-center gap-2 ${activeTab === 'reported'
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                                    }`}
                            >
                                {activeTab === 'reported' ? <Ban size={18} /> : <ThumbsUp size={18} />}
                                {activeTab === 'reported' ? 'Block Post' : 'Unblock Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostManagement;
