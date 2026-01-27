import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, UserPlus, Shield, ChevronLeft, ChevronRight, Edit, Trash2, Eye, X, User } from 'lucide-react';
import PermissionManagement from './PermissionManagement';

const AdminWebUser = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });

    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'permission'

    // View Modal State
    const [viewUser, setViewUser] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);

    // Delete Modal State
    const [userToDelete, setUserToDelete] = useState(null);

    // Add User Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        account_type_alias: 'acc.organization' // Default
    });

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editUser, setEditUser] = useState(null);

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get('https://test.trippldee.com/next/api/admin-web-users/get-all-users', {
                params: {
                    page: page,
                    search: searchTerm
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status) {
                setUsers(response.data.data);
                if (response.data.meta) {
                    setPagination({
                        current_page: response.data.meta.current_page,
                        last_page: response.data.meta.last_page,
                        total: response.data.meta.total,
                        per_page: response.data.meta.per_page
                    });
                }
            } else {
                toast.error(response.data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching admin users:', error);
            toast.error('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchUsers(newPage);
        }
    };

    const handleViewClick = async (user) => {
        setShowViewModal(true);
        setViewLoading(true);
        setViewUser(null);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get('https://test.trippldee.com/next/api/admin-web-users/user', {
                headers: { Authorization: `Bearer ${token}` },
                params: { user_referral_code: user.referral_code }
            });

            if (response.data.success) {
                setViewUser(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch user details');
                setShowViewModal(false);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Error loading details');
            setShowViewModal(false);
        } finally {
            setViewLoading(false);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.delete('https://test.trippldee.com/next/api/admin-web-users/delete/user', {
                headers: { Authorization: `Bearer ${token}` },
                data: { user_referral_code: userToDelete.referral_code }
            });

            if (response.data.success || response.data.status) {
                toast.success(response.data.message || 'User deleted successfully');
                setUserToDelete(null);
                fetchUsers(pagination.current_page);
            } else {
                toast.error(response.data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Error deleting user');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (user, newStatus) => {
        try {
            const token = localStorage.getItem('admin_token');
            // Optimistic update
            setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));

            const response = await axios.patch('https://test.trippldee.com/next/api/admin-web-users/user/status',
                { user_referral_code: user.referral_code, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.status || response.data.success) {
                toast.success(`User status updated to ${newStatus}`);
            } else {
                // Revert on failure
                toast.error('Failed to update status');
                fetchUsers(pagination.current_page);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status');
            fetchUsers(pagination.current_page); // Revert
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (newUser.password !== newUser.password_confirmation) {
            toast.error('Passwords do not match');
            return;
        }

        setAddLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.post('https://test.trippldee.com/next/api/admin-web-users/create-user', newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success || response.data.status) { // Check for success flag
                toast.success('Admin user created successfully');
                setShowAddModal(false);
                setNewUser({
                    name: '',
                    email: '',
                    phone_number: '',
                    password: '',
                    password_confirmation: '',
                    account_type_alias: 'acc.organization'
                });
                fetchUsers(1); // Refresh list
            } else {
                // Handle validation errors or messages
                const msg = response.data.message || 'Failed to create user';
                toast.error(msg);
                if (response.data.errors) {
                    console.error("Validation errors:", response.data.errors);
                }
            }
        } catch (error) {
            console.error('Create user error:', error);
            const msg = error.response?.data?.message || 'Error creating user';
            toast.error(msg);
        } finally {
            setAddLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleEditClick = async (user) => {
        setShowEditModal(true);
        setEditLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get('https://test.trippldee.com/next/api/admin-web-users/user', {
                headers: { Authorization: `Bearer ${token}` },
                params: { user_referral_code: user.referral_code }
            });

            if (response.data.success) {
                const userData = response.data.data;
                setEditUser({
                    user_referral_code: userData.referral_code,
                    name: userData.name || '',
                    email: userData.email || '',
                    phone_number: userData.phone_number || '',
                    user_name: userData.user_name || '',
                    gender: userData.details?.gender || '',
                    native_place: userData.details?.native_place || '',
                    area: userData.details?.area || '',
                    location: userData.location || '',
                    landmark: userData.details?.landmark || '',
                    pincode: userData.details?.pincode || '',
                    facebook_url: userData.details?.social_links?.facebook || '',
                    linkedin_url: userData.details?.social_links?.linkedin || '',
                    twitter_url: userData.details?.social_links?.twitter || '',
                    youtube_url: userData.details?.social_links?.youtube || '',
                    whatsapp_url: userData.details?.social_links?.whatsapp || '',
                    status: userData.status || ''
                });
            } else {
                toast.error('Failed to fetch user details for editing');
                setShowEditModal(false);
            }
        } catch (error) {
            console.error('Error fetching user for edit:', error);
            toast.error('Error loading user details');
            setShowEditModal(false);
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditUser(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.patch('https://test.trippldee.com/next/api/admin-web-users/update-user', editUser, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success || response.data.status || response.data.user_referral_code) { // API returns the updated object directly sometimes
                toast.success('User updated successfully');
                setShowEditModal(false);
                fetchUsers(pagination.current_page);
            } else {
                toast.error(response.data.message || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Error updating user');
        } finally {
            setEditLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300">
            <div className="border-b px-4 pt-4 md:px-6 md:pt-6 flex gap-8 dark:border-gray-800 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'users'
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    Admin Users
                    {activeTab === 'users' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('permission')}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'permission'
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    Permission
                    {activeTab === 'permission' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                    )}
                </button>
            </div>

            <div className="p-4 md:p-6">
                {activeTab === 'users' ? (
                    <>
                        {/* Header Actions for Users */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Shield className="text-orange-600" size={24} />
                                    Admin Web Users
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage administrative access and web users.</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-orange-600/20"
                            >
                                <UserPlus size={18} />
                                Add Admin User
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1 max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search admin users..."
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
                                        <th className="px-6 py-4">User Details</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Account Type</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Loading users...
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No admin users found
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="bg-white hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-gray-300"
                                            >
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                                                    #{user.id}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 dark:bg-slate-700">
                                                            {user.profile_image_url ? (
                                                                <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="font-bold text-gray-500 text-xs">{user.name?.[0]?.toUpperCase()}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{user.referral_code}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <span className="text-gray-900 dark:text-gray-300">{user.email || 'N/A'}</span>
                                                        <span className="text-gray-500 dark:text-gray-400">{user.country_code} {user.phone_number}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                                        {user.account_type?.type || user.account_type_alias || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={user.status || 'inactive'}
                                                        onChange={(e) => handleStatusChange(user, e.target.value)}
                                                        className={`px-2 py-1 rounded text-xs font-semibold border focus:outline-none focus:ring-1 focus:ring-opacity-50 cursor-pointer ${user.status === 'active' ? 'bg-green-100 text-green-700 border-green-200 focus:ring-green-500 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                                user.status === 'blocked' ? 'bg-red-100 text-red-700 border-red-200 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                                                                    'bg-gray-100 text-gray-700 border-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                            }`}
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="blocked">Blocked</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleViewClick(user)}
                                                            className="p-1.5 text-green-500 hover:bg-green-50 rounded transition-colors dark:hover:bg-green-900/20"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClick(user)}
                                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors dark:hover:bg-blue-900/20"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
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

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t dark:border-gray-800 mt-4">
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
                    </>
                ) : (
                    <div className="-m-4 md:-m-6">
                        <PermissionManagement />
                    </div>
                )}
            </div>


            {/* View Details Modal */}
            {
                showViewModal && (
                    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800 flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="p-1.5 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30 dark:text-green-400">
                                        <User size={18} />
                                    </span>
                                    Admin User Details
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
                                        <p className="text-gray-500 dark:text-gray-400">Loading user information...</p>
                                    </div>
                                ) : viewUser ? (
                                    <div className="space-y-8">
                                        {/* Header Info */}
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden ring-4 ring-gray-50 dark:ring-gray-800 shrink-0">
                                                {viewUser.profile_image_url ? (
                                                    <img src={viewUser.profile_image_url} alt={viewUser.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-2xl font-bold">
                                                        {viewUser.name?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center sm:text-left space-y-1">
                                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{viewUser.name}</h4>
                                                <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">{viewUser.referral_code}</p>
                                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${viewUser.status === 'active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {viewUser.status || 'Inactive'}
                                                    </span>
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {viewUser.account_type?.type || viewUser.account_type_alias || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Left Side: Details */}
                                            <div className="flex-1 grid grid-cols-1 gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold dark:text-gray-400">Email Address</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viewUser.email || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold dark:text-gray-400">Phone Number</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viewUser.country_code} {viewUser.phone_number}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold dark:text-gray-400">Created At</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {viewUser.created_at ? new Date(viewUser.created_at).toLocaleString() : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold dark:text-gray-400">Online Status</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{viewUser.is_online || 'Offline'}</p>
                                                </div>
                                            </div>

                                            {/* Right Side: QR Code */}
                                            {viewUser.user_qr_code_url && (
                                                <div className="md:w-48 flex flex-col items-center md:items-end md:border-l md:border-gray-100 md:dark:border-gray-800 md:pl-6 pt-6 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold dark:text-gray-400 mb-3 w-full text-center md:text-right">User QR Code</p>
                                                    <div className="bg-gray-50 p-2 rounded-xl border border-dashed border-gray-200 inline-block dark:bg-slate-800 dark:border-gray-700">
                                                        <img src={viewUser.user_qr_code_url} alt="QR Code" className="w-40 h-40 object-contain" />
                                                    </div>
                                                </div>
                                            )}
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
                )
            }

            {/* Delete Confirmation Modal */}
            {
                userToDelete && (
                    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800">
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 dark:bg-red-900/30 dark:text-red-500">
                                    <Trash2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Delete Admin User</h3>
                                <p className="text-gray-500 mb-6 dark:text-gray-400">
                                    Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{userToDelete.name}"</span>?
                                    <br /><span className="text-xs text-red-500 mt-1 block">This action cannot be undone.</span>
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setUserToDelete(null)}
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

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
                                    <UserPlus size={18} />
                                </span>
                                Add New Admin User
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="addUserForm" onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={newUser.name}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all"
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={newUser.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            required
                                            value={newUser.phone_number}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all"
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
                                    <select
                                        name="account_type_alias"
                                        value={newUser.account_type_alias}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all appearance-none"
                                    >
                                        <option value="acc.organization">Organization (Vendor)</option>
                                        <option value="acc.user">Private User</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            minLength={6}
                                            value={newUser.password}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all"
                                            placeholder="Min. 6 characters"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            required
                                            minLength={6}
                                            value={newUser.password_confirmation}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all"
                                            placeholder="Re-enter password"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 dark:bg-slate-800/50 dark:border-gray-800 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-slate-800"
                                disabled={addLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="addUserForm"
                                className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={addLoading}
                            >
                                {addLoading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit User Modal */}
            {showEditModal && editUser && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                                    <Edit size={18} />
                                </span>
                                Edit Admin User
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {editLoading && !editUser.user_referral_code ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <form id="editUserForm" onSubmit={handleUpdateUser} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                            <input type="text" name="name" value={editUser.name} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                            <input type="email" name="email" value={editUser.email} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                            <input type="text" name="phone_number" value={editUser.phone_number} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Name</label>
                                            <input type="text" name="user_name" value={editUser.user_name} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                            <select name="gender" value={editUser.gender} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white">
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Native Place</label>
                                            <input type="text" name="native_place" value={editUser.native_place} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area</label>
                                            <input type="text" name="area" value={editUser.area} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                            <input type="text" name="location" value={editUser.location} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Landmark</label>
                                            <input type="text" name="landmark" value={editUser.landmark} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                                            <input type="text" name="pincode" value={editUser.pincode} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Social Links</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" name="facebook_url" placeholder="Facebook URL" value={editUser.facebook_url} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                            <input type="text" name="linkedin_url" placeholder="LinkedIn URL" value={editUser.linkedin_url} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                            <input type="text" name="twitter_url" placeholder="Twitter URL" value={editUser.twitter_url} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                            <input type="text" name="youtube_url" placeholder="YouTube URL" value={editUser.youtube_url} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                            <input type="text" name="whatsapp_url" placeholder="WhatsApp URL" value={editUser.whatsapp_url} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-gray-700 dark:text-white" />
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 dark:bg-slate-800/50 dark:border-gray-800 flex justify-end gap-3">
                            <button onClick={() => setShowEditModal(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 dark:bg-slate-900 dark:text-gray-300 dark:border-gray-700">Cancel</button>
                            <button type="submit" form="editUserForm" disabled={editLoading} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-70">
                                {editLoading ? 'Updating...' : 'Update User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWebUser;
