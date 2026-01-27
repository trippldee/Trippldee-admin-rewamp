import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Search,
    Eye,
    Edit,
    Trash2,
    Key,
    ChevronLeft,
    ChevronRight,
    FileSpreadsheet,
    FileText,
    Copy,
    Columns,
    X
} from 'lucide-react';

const RoleManagement = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [roleForm, setRoleForm] = useState({
        name: '',
        description: '',
        permissions: []
    });
    const [editingRoleAlias, setEditingRoleAlias] = useState(null);

    // View Modal State
    const [viewRole, setViewRole] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'new') {
            const fetchAvailablePermissions = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('admin_token');
                    const response = await axios.get('https://test.trippldee.com/next/api/admin-roles-permissions/list-permissions', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.status) { // Check for status true as per GET response
                        // The response structure is { data: [...], ... } based on user input
                        const perms = response.data.data;
                        if (Array.isArray(perms)) {
                            setAvailablePermissions(perms);
                        } else {
                            console.error('Permissions data is not an array:', response.data);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching permissions:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchAvailablePermissions();
        }
    }, [activeTab]);

    const handlePermissionToggle = (permissionId, actionName) => {
        setRoleForm(prev => {
            const currentPermissions = [...prev.permissions];
            const existingPermIndex = currentPermissions.findIndex(p => p.id === permissionId);
            if (existingPermIndex >= 0) {
                const existingPerm = { ...currentPermissions[existingPermIndex] };
                const actionIndex = existingPerm.action.indexOf(actionName);
                let newActions;
                if (actionIndex >= 0) {
                    newActions = existingPerm.action.filter(a => a !== actionName);
                } else {
                    newActions = [...existingPerm.action, actionName];
                }
                if (newActions.length === 0) {
                    currentPermissions.splice(existingPermIndex, 1);
                } else {
                    existingPerm.action = newActions;
                    currentPermissions[existingPermIndex] = existingPerm;
                }
                return { ...prev, permissions: currentPermissions };
            } else {
                return { ...prev, permissions: [...currentPermissions, { id: permissionId, action: [actionName] }] };
            }
        });
    };

    const isActionSelected = (permissionId, actionName) => {
        const perm = roleForm.permissions.find(p => p.id === permissionId);
        return perm && perm.action.includes(actionName);
    };

    const handleSelectAllActions = (permission, allActions) => {
        const allSelected = allActions.every(action => isActionSelected(permission.id, action));
        setRoleForm(prev => {
            const currentPermissions = [...prev.permissions];
            const existingPermIndex = currentPermissions.findIndex(p => p.id === permission.id);
            if (existingPermIndex >= 0) {
                if (allSelected) {
                    currentPermissions.splice(existingPermIndex, 1);
                } else {
                    currentPermissions[existingPermIndex] = { id: permission.id, action: [...allActions] };
                }
            } else {
                if (!allSelected) {
                    currentPermissions.push({ id: permission.id, action: [...allActions] });
                }
            }
            return { ...prev, permissions: currentPermissions };
        });
    };

    const handleSubmitRole = async () => {
        if (!roleForm.name) {
            toast.error('Role name is required');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');

            // Map permissions to include alias as required by the API
            const formattedPermissions = roleForm.permissions.map(p => {
                const permDetails = availablePermissions.find(ap => ap.id === p.id);
                return {
                    alias: permDetails?.alias,
                    action: p.action
                };
            }).filter(p => p.alias);

            const payload = {
                ...roleForm,
                permissions: formattedPermissions
            };

            if (editingRoleAlias) {
                payload.role_alias = editingRoleAlias;
            }

            const response = await axios.post('https://test.trippldee.com/next/api/admin-roles-permissions/create-or-update-role', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success(response.data.message || (editingRoleAlias ? 'Role updated successfully!' : 'Role created successfully!'));
                setRoleForm({ name: '', description: '', permissions: [] });
                setEditingRoleAlias(null);
                setActiveTab('list');
                fetchRoles(); // Refresh the list after creation
            } else {
                toast.error(response.data.message || 'Failed to create role');
            }
        } catch (error) {
            console.error('Error creating role:', error);
            toast.error('Error creating role');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (role) => {
        setRoleToDelete(role);
    };

    const handleEditClick = async (role) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            if (!role.alias) {
                toast.error('Cannot edit role: Alias missing');
                return;
            }

            // Fetch full details to get current permissions
            const response = await axios.get(`https://test.trippldee.com/next/api/admin-roles-permissions/${role.alias}/role`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const roleData = response.data.data;
                // Map permissions from API format back to form format { id, action: [] }
                // API perm: { id, name, alias, action: [...] }
                // Form perm: { id, action: [...] }
                const formPermissions = (roleData.permissions || []).map(p => ({
                    id: p.id,
                    action: p.action || []
                }));

                setRoleForm({
                    name: roleData.name,
                    description: roleData.description,
                    permissions: formPermissions
                });
                setEditingRoleAlias(roleData.alias);
                setActiveTab('new');
            } else {
                toast.error('Failed to fetch role details for editing');
            }
        } catch (error) {
            console.error('Error fetching role for edit:', error);
            toast.error('Error loading role details');
        } finally {
            setLoading(false);
        }
    };

    const handleViewClick = async (role) => {
        setShowViewModal(true);
        setViewLoading(true);
        setViewRole(null); // Reset content
        try {
            const token = localStorage.getItem('admin_token');
            // Assuming alias is present on the role object from the list.
            // If alias is missing, we might need to fallback or error, but based on requirements alias is key.
            if (!role.alias) {
                toast.error('Role alias missing, cannot fetch details');
                setShowViewModal(false);
                return;
            }

            const response = await axios.get(`https://test.trippldee.com/next/api/admin-roles-permissions/${role.alias}/role`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setViewRole(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch role details');
                setShowViewModal(false);
            }
        } catch (error) {
            console.error('Error fetching role details:', error);
            if (error.response && error.response.status === 401) {
                toast.error('Session expired. Please login again.');
            } else {
                toast.error('Error loading role details');
            }
            setShowViewModal(false);
        } finally {
            setViewLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!roleToDelete) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.delete('https://test.trippldee.com/next/api/admin-roles-permissions/manager/delete/role', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    id: roleToDelete.id
                }
            });

            if (response.data.success) {
                toast.success('Role deleted successfully!');
                setRoleToDelete(null);
                fetchRoles(pagination.current_page); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to delete role');
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            if (error.response && error.response.status === 401) {
                toast.error('Session expired. Please login again.');
            } else {
                toast.error('Error deleting role');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get(`https://test.trippldee.com/next/api/admin-roles-permissions/list-roles?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.status) {
                setRoles(response.data.data);
                if (response.data.meta) {
                    setPagination({
                        current_page: response.data.meta.current_page,
                        last_page: response.data.meta.last_page,
                        total: response.data.meta.total,
                        per_page: response.data.meta.per_page
                    });
                }
            } else {
                toast.error('Failed to fetch roles');
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            if (error.response && error.response.status === 401) {
                toast.error('Session expired. Please login again.');
                // Optional: navigate to login if hooks are available
            } else {
                toast.error('Error loading roles data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'list') {
            fetchRoles();
        }
    }, [activeTab]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchRoles(newPage);
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
                    Role List
                    {activeTab === 'list' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => {
                        setActiveTab('new');
                        setEditingRoleAlias(null);
                        setRoleForm({ name: '', description: '', permissions: [] });
                    }}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'new'
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    {editingRoleAlias ? 'Edit Role' : 'New Role'}
                    {activeTab === 'new' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                    )}
                </button>
            </div>

            <div className="p-4 md:p-6">
                {activeTab === 'list' && (
                    <div className="space-y-6">
                        {/* Controls Bar */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <select
                                    className="border border-gray-300 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                                    value={pagination.per_page}
                                    onChange={(e) => console.log('Change page size', e.target.value)}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button className="absolute right-0 top-0 h-full px-3 text-white bg-orange-500 rounded-r-lg hover:bg-orange-600 transition-colors">
                                        <Search size={18} />
                                    </button>
                                </div>

                                <div className="flex bg-slate-900 text-white rounded-lg overflow-hidden shrink-0">
                                    <button className="p-2 hover:bg-slate-800 transition-colors" title="Copy">
                                        <Copy size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-800 transition-colors" title="Excel">
                                        <FileSpreadsheet size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-800 transition-colors" title="PDF">
                                        <FileText size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-800 transition-colors" title="Columns">
                                        <Columns size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold dark:bg-slate-800 dark:text-gray-300">
                                    <tr>
                                        <th className="px-6 py-4">#</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Alias</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Loading roles...
                                            </td>
                                        </tr>
                                    ) : roles.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No roles found
                                            </td>
                                        </tr>
                                    ) : (
                                        roles.map((role, index) => (
                                            <tr
                                                key={role.id}
                                                className="bg-white hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-gray-300"
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {(pagination.current_page - 1) * pagination.per_page + index + 1}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {role.name}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-mono dark:bg-slate-800 dark:text-gray-300">
                                                        {role.alias}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                    {role.description}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${role.is_active
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {role.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => handleViewClick(role)}
                                                            className="text-green-500 hover:text-green-600 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClick(role)}
                                                            className="text-blue-500 hover:text-blue-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(role)}
                                                            className="text-red-500 hover:text-red-600 transition-colors"
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
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> to <span className="font-medium">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> entries
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="px-3 py-1 text-sm font-medium text-red-500 bg-white border border-gray-200 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-gray-700"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 text-sm font-medium rounded border ${pagination.current_page === page
                                            ? 'bg-red-500 text-white border-red-500'
                                            : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="px-3 py-1 text-sm font-medium text-red-500 bg-white border border-gray-200 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-gray-700"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'new' && (
                    <div className="max-w-4xl mx-auto space-y-8 pb-12">
                        {/* Header */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {editingRoleAlias ? `Edit Role: ${roleForm.name}` : 'Create New Role'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {editingRoleAlias
                                    ? 'Update the role details and modify permission assignments.'
                                    : 'Define the role details and assign permissions to control access levels.'}
                            </p>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Role Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Content Manager"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                                    value={roleForm.name}
                                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    placeholder="Brief description of the role..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                                    value={roleForm.description}
                                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Permissions Matrix */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Key size={18} className="text-red-500" />
                                Permission Assignment
                            </h4>

                            <div className="border rounded-xl overflow-x-auto dark:border-gray-700 text-sm bg-white dark:bg-slate-900 shadow-sm">
                                {loading && availablePermissions.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p>Loading permissions...</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase text-gray-700 dark:text-gray-300 font-semibold tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4 border-b dark:border-gray-700 w-1/4">Module Name</th>
                                                <th className="px-6 py-4 border-b dark:border-gray-700">Available Permissions</th>
                                                <th className="px-6 py-4 border-b dark:border-gray-700 w-32 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {availablePermissions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                        <p className="mb-4">No permissions found available for assignment.</p>
                                                        <button
                                                            onClick={() => {
                                                                const token = localStorage.getItem('admin_token');
                                                                setLoading(true);
                                                                axios.get('https://test.trippldee.com/next/api/admin-roles-permissions/list-permissions', {
                                                                    headers: { Authorization: `Bearer ${token}` }
                                                                })
                                                                    .then(response => {
                                                                        if (response.data.status) {
                                                                            const perms = response.data.data;
                                                                            if (Array.isArray(perms)) setAvailablePermissions(perms);
                                                                        }
                                                                    })
                                                                    .finally(() => setLoading(false));
                                                            }}
                                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                                            type="button"
                                                        >
                                                            Retry Loading
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                availablePermissions.map((permission) => (
                                                    <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                        <td className="px-6 py-4 align-top">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900 dark:text-white capitalize">{permission.name}</span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                                                                    {permission.description || permission.alias}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 align-middle">
                                                            <div className="flex flex-wrap gap-3">
                                                                {(permission.action || []).map((actionName) => {
                                                                    const isSelected = isActionSelected(permission.id, actionName);
                                                                    return (
                                                                        <button
                                                                            key={actionName}
                                                                            onClick={() => handlePermissionToggle(permission.id, actionName)}
                                                                            type="button"
                                                                            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 select-none ${isSelected
                                                                                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 shadow-sm'
                                                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-slate-700'
                                                                                }`}
                                                                        >
                                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300 dark:border-gray-500'
                                                                                }`}>
                                                                                {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                                            </div>
                                                                            <span className="capitalize">{actionName}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 align-middle text-center">
                                                            {permission.action && permission.action.length > 0 && (
                                                                <button
                                                                    onClick={() => handleSelectAllActions(permission, permission.action || [])}
                                                                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                                    type="button"
                                                                >
                                                                    Select All
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-800">
                            <button
                                onClick={() => {
                                    setRoleForm({ name: '', description: '', permissions: [] });
                                    setEditingRoleAlias(null);
                                    setActiveTab('list');
                                }}
                                className="px-6 py-2.5 font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitRole}
                                disabled={loading}
                                className="px-6 py-2.5 font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {editingRoleAlias ? 'Update Role' : 'Create Role'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {
                roleToDelete && (
                    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800">
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 dark:bg-red-900/30 dark:text-red-500">
                                    <Trash2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Delete Role</h3>
                                <p className="text-gray-500 mb-6 dark:text-gray-400">
                                    Are you sure you want to delete the role <span className="font-semibold text-gray-900 dark:text-white">"{roleToDelete.name}"</span>? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setRoleToDelete(null)}
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
                )
            }

            {/* View Details Modal */}
            {showViewModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="p-1.5 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30 dark:text-green-400">
                                    <Eye size={18} />
                                </span>
                                Role Details
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
                                    <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Loading role information...</p>
                                </div>
                            ) : viewRole ? (
                                <div className="space-y-8">
                                    {/* Primary Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold dark:text-gray-400">Role Name</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{viewRole.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold dark:text-gray-400">Alias</p>
                                            <p className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-md inline-block dark:bg-slate-800 dark:text-gray-300">
                                                {viewRole.alias}
                                            </p>
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold dark:text-gray-400">Description</p>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 p-3 rounded-lg dark:bg-slate-800/50 border border-transparent dark:border-gray-800">
                                                {viewRole.description || 'No description provided.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status & Meta */}
                                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${viewRole.is_active
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {viewRole.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Enabled:</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${viewRole.is_enabled
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {viewRole.is_enabled ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        {viewRole.created_at && (
                                            <div className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                                                <span>Created:</span>
                                                <span className="font-mono text-gray-500 dark:text-gray-500">{new Date(viewRole.created_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Permissions List */}
                                    {viewRole.permissions && viewRole.permissions.length > 0 && (
                                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Key size={16} className="text-red-500" />
                                                Assigned Permissions
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {viewRole.permissions.map((perm, idx) => (
                                                    <div key={perm.id || idx} className="p-3 border rounded-lg bg-gray-50 dark:bg-slate-800/50 dark:border-gray-700">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="font-medium text-gray-900 dark:text-white text-sm">{perm.name}</span>
                                                            <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded text-gray-500 font-mono dark:bg-slate-900 dark:border-gray-600">
                                                                {perm.alias}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {perm.action && Array.isArray(perm.action) && perm.action.map((act, i) => (
                                                                <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30 uppercase tracking-wide">
                                                                    {act}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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

        </div>
    );
};

export default RoleManagement;
