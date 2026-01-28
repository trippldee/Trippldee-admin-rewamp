import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, FileText, Eye, X, ChevronLeft, ChevronRight, Calendar, User, Plus, Edit, CheckSquare, Trash2 } from 'lucide-react';

const StaticPages = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);

    // View Modal State
    const [viewPage, setViewPage] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);

    // Add/Edit Modal State
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        page_type: 'about_us',
        account_type_alias: '',
        page_alias: ''
    });

    const fetchPages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get('https://test.trippldee.com/next/api/admin-static-pages/list-static-pages', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setPages(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch static pages');
            }
        } catch (error) {
            console.error('Error fetching static pages:', error);
            toast.error('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleCreateClick = () => {
        setIsEditing(false);
        setFormData({
            title: '',
            content: '',
            page_type: 'about_us',
            account_type_alias: '',
            page_alias: ''
        });
        setShowAddEditModal(true);
    };

    const handleEditClick = (page) => {
        setIsEditing(true);
        setFormData({
            title: page.title,
            content: page.content || '', // fetch detail first? Usually list might not have content. 
            // The list API response has title, alias, account_type_alias. 
            // To get content we might need to fetch detail or if list has it.
            // The list example provided previously: {"id":1, "title":"...", "alias":"...", "account_type_alias":... } -> No content.
            // So we should probably assume we need to fetch details first or rely on separate fetch.
            // However, for better UX let's fetch details when opening edit if content is missing from list item.
            // BUT, strictly speaking for MVP, let's assume we might need to fetch or just start with what we have.
            // Wait, the user provided "GET specific page details" API. So we should probably fetch that before editing if we want to show existing content.
            // Let's stick to a simpler approach: When "Edit" is clicked, we call "handleViewClick" logic but for edit mode, OR we just modify handleEditClick to fetch.
            page_type: 'about_us', // We might need to map alias to type if not provided, or ask user. 
            // The list doesn't return page_type. The detail does.
            // Let's fetch detail first then populate form.
            account_type_alias: page.account_type_alias || '',
            page_alias: page.alias
        });
        // We will fetch details inside this flow or simpler: use a separate fetch for edit.
        fetchPageDetailsForEdit(page.alias);
    };

    const fetchPageDetailsForEdit = async (alias) => {
        setFormLoading(true);
        setShowAddEditModal(true); // Show modal immediately with loading state potentially
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get('https://test.trippldee.com/next/api/admin-static-pages/get-page', {
                headers: { Authorization: `Bearer ${token}` },
                params: { page_alias: alias }
            });
            if (response.data.success) {
                const data = response.data.data;
                setFormData({
                    title: data.title,
                    content: data.content,
                    page_type: data.page_type || 'about_us',
                    account_type_alias: data.account_type_alias || '',
                    page_alias: data.alias
                });
            } else {
                toast.error('Failed to fetch page details for editing');
                setShowAddEditModal(false);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            toast.error('Error loading page details');
            setShowAddEditModal(false);
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormSave = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const payload = {
                title: formData.title,
                content: formData.content,
                page_type: formData.page_type,
            };

            if (formData.page_type === 'privacy_policy' || formData.page_type === 'terms_and_conditions') {
                if (formData.account_type_alias) {
                    payload.account_type_alias = formData.account_type_alias;
                }
            }

            if (isEditing) {
                payload.page_alias = formData.page_alias;
            }

            const response = await axios.post('https://test.trippldee.com/next/api/admin-static-pages/pages/save', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success || response.status === 200) { // Checking status as well since success field might be missing in some APIs
                toast.success(isEditing ? 'Page updated successfully' : 'Page created successfully');
                setShowAddEditModal(false);
                fetchPages();
            } else {
                toast.error(response.data.message || 'Failed to save page');
            }
        } catch (error) {
            console.error('Error saving page:', error);
            toast.error('Error saving page');
        } finally {
            setFormLoading(false);
        }
    };
    // Delete Modal State
    const [pageToDelete, setPageToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ... handleViewClick ...

    const handleDeleteClick = (page) => {
        setPageToDelete(page);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!pageToDelete) return;
        setDeleteLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            // Assuming endpoint based on save pattern
            const response = await axios.post('https://test.trippldee.com/next/api/admin-static-pages/pages/delete',
                { page_alias: pageToDelete.alias },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success || response.status === 200) {
                toast.success('Page deleted successfully');
                setShowDeleteModal(false);
                fetchPages();
            } else {
                toast.error(response.data.message || 'Failed to delete page');
            }
        } catch (error) {
            console.error('Error deleting page:', error);
            toast.error('Error deleting page');
        } finally {
            setDeleteLoading(false);
            setPageToDelete(null);
        }
    };

    const handleViewClick = async (page) => {
        setShowViewModal(true);
        setViewLoading(true);
        setViewPage(null);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get('https://test.trippldee.com/next/api/admin-static-pages/get-page', {
                headers: { Authorization: `Bearer ${token}` },
                params: { page_alias: page.alias }
            });

            if (response.data.success) {
                setViewPage(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch page details');
                setShowViewModal(false);
            }
        } catch (error) {
            console.error('Error fetching page details:', error);
            toast.error('Error loading details');
            setShowViewModal(false);
        } finally {
            setViewLoading(false);
        }
    };

    const filteredPages = Array.isArray(pages) ? pages.filter(page => {
        const title = page.title || '';
        const alias = page.alias || '';
        const searchLower = searchTerm.toLowerCase();
        return title.toLowerCase().includes(searchLower) || alias.toLowerCase().includes(searchLower);
    }) : [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300">
            <div className="p-4 md:p-6">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="text-orange-600" size={24} />
                            Static Pages
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage static content pages like Privacy Policy, Terms, etc.</p>
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-orange-600/20"
                    >
                        <Plus size={18} />
                        Create Page
                    </button>
                </div>

                {/* Search */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search pages..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold dark:bg-slate-800 dark:text-gray-300">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Alias</th>
                                <th className="px-6 py-4">Account Type</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Loading pages...
                                    </td>
                                </tr>
                            ) : filteredPages.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No pages found
                                    </td>
                                </tr>
                            ) : (
                                filteredPages.map((page) => (
                                    <tr
                                        key={page.id}
                                        className="bg-white hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-gray-300"
                                    >
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                                            #{page.id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {page.title}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                            {page.alias}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${page.account_type_alias === 'acc.organization'
                                                ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                                : page.account_type_alias === 'acc.user'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                                                    : 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                }`}>
                                                {page.account_type_alias || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewClick(page)}
                                                    className="p-1.5 text-green-500 hover:bg-green-50 rounded transition-colors dark:hover:bg-green-900/20"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(page)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors dark:hover:bg-blue-900/20"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(page)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors dark:hover:bg-red-900/20"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Details Modal */}
            {showViewModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText size={20} className="text-orange-600" />
                                Page Details
                            </h3>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {viewLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Loading page content...</p>
                                </div>
                            ) : viewPage ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-1 pb-4 border-b border-gray-100 dark:border-gray-800">
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{viewPage.title}</h4>
                                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-mono bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{viewPage.alias}</span>
                                            {viewPage.account_type_alias && (
                                                <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-medium border border-blue-100 dark:border-blue-800">
                                                    {viewPage.account_type_alias}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                                        <div dangerouslySetInnerHTML={{ __html: viewPage.content }} />
                                    </div>

                                    <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User size={14} />
                                            <span>Type: {viewPage.page_type}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>Created: {viewPage.created_at ? new Date(viewPage.created_at).toLocaleString() : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>Updated: {viewPage.updated_at ? new Date(viewPage.updated_at).toLocaleString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    No details available.
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 dark:bg-slate-800/50 dark:border-gray-800 flex justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddEditModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
                                    {isEditing ? <Edit size={18} /> : <Plus size={18} />}
                                </span>
                                {isEditing ? 'Edit Page' : 'Create New Page'}
                            </h3>
                            <button
                                onClick={() => setShowAddEditModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {formLoading && isEditing && !formData.title ? (
                                <div className="text-center py-8">Loading page data...</div>
                            ) : (
                                <form id="pageForm" onSubmit={handleFormSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Page Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                                                placeholder="e.g. Terms and Conditions"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Page Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                required
                                                value={formData.page_type}
                                                onChange={(e) => setFormData({ ...formData, page_type: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                                            >
                                                <option value="about_us">About Us</option>
                                                <option value="privacy_policy">Privacy Policy</option>
                                                <option value="terms_and_conditions">Terms & Conditions</option>
                                            </select>
                                        </div>

                                        {(formData.page_type === 'privacy_policy' || formData.page_type === 'terms_and_conditions') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Account Type
                                                </label>
                                                <select
                                                    value={formData.account_type_alias}
                                                    onChange={(e) => setFormData({ ...formData, account_type_alias: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                                                >
                                                    <option value="">Select Account Type</option>
                                                    <option value="acc.organization">Organization</option>
                                                    <option value="acc.user">User</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Content <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                required
                                                rows={10}
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:bg-slate-800 dark:border-gray-700 dark:text-white font-mono text-sm"
                                                placeholder="Enter HTML content or plain text..."
                                            />
                                            <p className="text-xs text-gray-500 mt-1">HTML tags are supported.</p>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 dark:bg-slate-800/50 dark:border-gray-800 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAddEditModal(false)}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="pageForm"
                                disabled={formLoading}
                                className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {formLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckSquare size={18} />
                                        Save Page
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 dark:bg-red-900/30 dark:text-red-400">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Delete Page</h3>
                            <p className="text-gray-500 mb-6 dark:text-gray-400">
                                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-200">"{pageToDelete?.title}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {deleteLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaticPages;
