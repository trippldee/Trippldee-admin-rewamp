import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Search,
    Shield,
    ChevronLeft,
    ChevronRight,
    Edit,
    Trash2,
    Plus,
    Check,
    AlertCircle
} from 'lucide-react';

const COMMON_ACTIONS = [
    'create', 'read', 'edit', 'delete', 'list', 'block', 'verify', 'restore', 'upload', 'export'
];

const PermissionManagement = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'form'
    const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [permissionToDelete, setPermissionToDelete] = useState(null);
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        permission_for: '',
        action: [],
        is_active: true
    });

    const fetchPermissions = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get(`https://test.trippldee.com/next/api/admin-roles-permissions/list-permissions`, {
                params: { page: page },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status) {
                setPermissions(response.data.data);
                if (response.data.meta) {
                    setPagination({
                        current_page: response.data.meta.current_page,
                        last_page: response.data.meta.last_page,
                        total: response.data.meta.total,
                        per_page: response.data.meta.per_page
                    });
                }
            } else {
                toast.error(response.data.message || 'Failed to fetch permissions');
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
            toast.error('Error loading permissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissionDetails = async (alias) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get(`https://test.trippldee.com/next/api/admin-roles-permissions/${alias}/permission`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success || response.data.status) {
                const data = response.data.data;
                // data might come as array or object depending on API consistency, usually object for single get
                const perm = Array.isArray(data) ? data[0] : data;

                setFormData({
                    id: perm.id,
                    name: perm.name,
                    description: perm.description || '',
                    permission_for: perm.permission_for || perm.alias || '', // Fallback if not provided
                    action: perm.action || [],
                    is_active: perm.is_active
                });
                setFormMode('edit');
                setActiveTab('form');
            } else {
                toast.error('Failed to fetch permission details');
            }
        } catch (error) {
            console.error('Error fetching permission details:', error);
            toast.error('Error loading details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'list') {
            fetchPermissions(pagination.current_page);
        }
    }, [activeTab, pagination.current_page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            setPagination(prev => ({ ...prev, current_page: newPage }));
        }
    };

    // Client-side search
    const filteredPermissions = permissions.filter(perm =>
        perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.alias.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateClick = () => {
        setFormData({
            id: null,
            name: '',
            description: '',
            permission_for: '',
            action: [],
            is_active: true
        });
        setFormMode('create');
        setActiveTab('form');
    };

    const handleEditClick = (permission) => {
        fetchPermissionDetails(permission.alias);
    };

    const handleDeleteClick = (permission) => {
        setPermissionToDelete(permission);
    };

    const confirmDelete = async () => {
        if (!permissionToDelete) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.delete(`https://test.trippldee.com/next/api/admin-roles-permissions/${permissionToDelete.alias}/delete/permission`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success || response.data.status) {
                toast.success('Permission deleted successfully');
                setPermissionToDelete(null);
                fetchPermissions(pagination.current_page);
            } else {
                toast.error(response.data.message || 'Failed to delete permission');
            }
        } catch (error) {
            console.error('Error deleting permission:', error);
            toast.error('Error deleting permission');
        } finally {
            setLoading(false);
        }
    };

    const toggleAction = (actionName) => {
        setFormData(prev => {
            const newActions = prev.action.includes(actionName)
                ? prev.action.filter(a => a !== actionName)
                : [...prev.action, actionName];
            return { ...prev, action: newActions };
        });
    };

    const executeSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const payload = {
                name: formData.name,
                description: formData.description,
                permission_for: formData.permission_for,
                action: formData.action,
                is_active: formData.is_active,
                ...(formMode === 'edit' && { permission_id: formData.id })
            };

            const response = await axios.post('https://test.trippldee.com/next/api/admin-roles-permissions/create-or-update-permission', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success || response.data.status) {
                toast.success(`Permission ${formMode === 'create' ? 'created' : 'updated'} successfully`);
                setShowUpdateConfirm(false);
                setActiveTab('list');
                setFormData({
                    id: null,
                    name: '',
                    description: '',
                    permission_for: '',
                    action: [],
                    is_active: true
                });
            } else {
                toast.error(response.data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving permission:', error);
            toast.error('Error saving permission');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.permission_for) {
            toast.error('Name and Permission For are required');
            return;
        }

        if (formMode === 'edit') {
            setShowUpdateConfirm(true);
        } else {
            await executeSubmit();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300">
            {/* Tabs Header */}
            <div className="border-b px-4 pt-4 md:px-6 md:pt-6 flex gap-8 dark:border-gray-800 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'list'
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    Permission List
                    {activeTab === 'list' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={handleCreateClick}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'form'
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    {formMode === 'edit' ? 'Edit Permission' : 'New Permission'}
                    {activeTab === 'form' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                    )}
                </button>
            </div>

            <div className="p-4 md:p-6">
                {activeTab === 'list' ? (
                    <div className="space-y-6">
                        {/* Header & Search */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 hidden md:flex">
                                <Shield className="text-red-600" size={20} />
                                Managed Permissions
                            </h2>

                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search permissions..."
                                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="absolute right-0 top-0 h-full px-3 text-gray-500">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* List Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold dark:bg-slate-800 dark:text-gray-300">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Alias</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Actions Allowed</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {loading && permissions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Loading permissions...
                                            </td>
                                        </tr>
                                    ) : filteredPermissions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No permissions found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPermissions.map((perm) => (
                                            <tr
                                                key={perm.id}
                                                className="bg-white hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-gray-300"
                                            >
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                                                    #{perm.id}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {perm.name}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                                    {perm.alias}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                    {perm.description || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {perm.action && perm.action.slice(0, 3).map((act, idx) => (
                                                            <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] border border-gray-200 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-400 capitalize">
                                                                {act}
                                                            </span>
                                                        ))}
                                                        {perm.action && perm.action.length > 3 && (
                                                            <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] border border-gray-200 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-500">
                                                                +{perm.action.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditClick(perm)}
                                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(perm)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
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

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t mt-6 dark:border-gray-800">
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
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto space-y-8 pb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {formMode === 'create' ? 'Create New Permission' : 'Edit Permission'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Define the permission details and available actions.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Permission Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Users"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Permission For <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. User, Manager, System"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                                    value={formData.permission_for}
                                    onChange={(e) => setFormData({ ...formData, permission_for: e.target.value })}
                                />
                                <p className="text-xs text-gray-500">The module or entity this permission applies to.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Brief description..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:bg-slate-800 dark:border-gray-700 dark:text-white resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                    Available Actions
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {COMMON_ACTIONS.map(action => (
                                        <label key={action} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.action.includes(action)
                                            ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
                                            : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800'
                                            }`}>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.action.includes(action)
                                                ? 'bg-red-500 border-red-500'
                                                : 'border-gray-300 bg-white dark:bg-slate-800 dark:border-gray-600'
                                                }`}>
                                                {formData.action.includes(action) && <Check size={12} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.action.includes(action)}
                                                onChange={() => toggleAction(action)}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize select-none">{action}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Active
                                    </span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-4 pt-6 mt-6 border-t dark:border-gray-800">
                                <button
                                    onClick={() => setActiveTab('list')}
                                    className="px-6 py-2.5 font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-6 py-2.5 font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {formMode === 'create' ? 'Create Permission' : 'Update Permission'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {permissionToDelete && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 dark:bg-red-900/30 dark:text-red-500">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Delete Permission</h3>
                            <p className="text-gray-500 mb-6 dark:text-gray-400">
                                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{permissionToDelete.name}"</span>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPermissionToDelete(null)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Confirmation Modal */}
            {showUpdateConfirm && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 dark:bg-blue-900/30 dark:text-blue-500">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Update Permission</h3>
                            <p className="text-gray-500 mb-6 dark:text-gray-400">
                                Are you sure you want to update the details for <span className="font-semibold text-gray-900 dark:text-white">"{formData.name}"</span>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowUpdateConfirm(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeSubmit}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Yes, Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermissionManagement;
