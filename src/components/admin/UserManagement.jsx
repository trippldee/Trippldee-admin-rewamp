import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Search,
    Eye,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    User,
    Building,
    CheckCircle,
    XCircle,
    UserX,
    RotateCcw
} from 'lucide-react';

const UserManagement = ({ viewMode }) => {
    const [activeTab, setActiveTab] = useState(viewMode || 'users'); // 'users' or 'deleted'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [accountType, setAccountType] = useState('acc.organization'); // Default to organization
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });

    // For Modals
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToRestore, setUserToRestore] = useState(null);
    // const [userToEdit, setUserToEdit] = useState(null); // Assuming Edit implemented later or basic

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const endpoint = activeTab === 'deleted'
                ? 'https://test.trippldee.com/next/api/admin-web-users/get-deleted-users'
                : 'https://test.trippldee.com/next/api/admin-web-users/get-all-users';

            const response = await axios.get(endpoint, {
                params: {
                    page: page,
                    account_type_alias: accountType,
                    search: searchTerm
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
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
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error loading users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode) {
            setActiveTab(viewMode);
        }
    }, [viewMode]);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchUsers(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, accountType, activeTab]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchUsers(newPage);
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
            // Assuming delete uses referral code as per API docs: "user_referral_code" : "DDDAMUV"
            // The DELETE request body usually needs 'data' property in axios config for DELETE method
            const response = await axios.delete('https://test.trippldee.com/next/api/admin-web-users/delete/user', {
                headers: { Authorization: `Bearer ${token}` },
                data: { user_referral_code: userToDelete.referral_code }
            });

            if (response.data.success || response.data.status) { // Checking generic success
                toast.success('User deleted successfully');
                setUserToDelete(null);
                fetchUsers(pagination.current_page);
            } else {
                toast.error(response.data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Error deleting user');
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreClick = (user) => {
        setUserToRestore(user);
    };

    const confirmRestore = async () => {
        if (!userToRestore) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.post('https://test.trippldee.com/next/api/admin-web-users/restore/user', {
                user_referral_code: userToRestore.referral_code
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success || response.data.status) {
                toast.success('User restored successfully');
                setUserToRestore(null);
                fetchUsers(pagination.current_page);
            } else {
                toast.error(response.data.message || 'Failed to restore user');
            }
        } catch (error) {
            console.error('Restore error:', error);
            toast.error('Error restoring user');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'blocked' : 'active';
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.patch('https://test.trippldee.com/next/api/admin-web-users/user/status', {
                user_referral_code: user.referral_code,
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success || response.data.code === 200) {
                toast.success(`User ${newStatus} successfully`);
                fetchUsers(pagination.current_page);
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Status update error:', error);
            toast.error('Error updating status');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300">
            {/* Tabs & Controls Header */}
            <div className="border-b px-4 py-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 dark:border-gray-800">
                <div className="flex gap-8 overflow-x-auto w-full md:w-auto">
                    {!viewMode && (
                        <>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`pb-2 text-sm font-semibold transition-colors relative ${activeTab === 'users'
                                    ? 'text-red-600'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                All Users
                                {activeTab === 'users' && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('deleted')}
                                className={`pb-2 text-sm font-semibold transition-colors relative ${activeTab === 'deleted'
                                    ? 'text-red-600'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                Deleted Users
                                {activeTab === 'deleted' && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                                )}
                            </button>
                        </>
                    )}
                    {viewMode && (
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {viewMode === 'users' ? 'User List' : 'Deleted Users'}
                        </h2>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Account Type Filter */}
                    <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                    >
                        <option value="acc.organization">Organizations</option>
                        <option value="acc.user">Private Users</option>
                    </select>

                    {/* Search */}
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Name, ID, Email..."
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-red-600">
                            <Search size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-6">
                {(activeTab === 'users' || activeTab === 'deleted') && (
                    <div className="space-y-6">
                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold dark:bg-slate-800 dark:text-gray-300">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">User Details</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Type</th>
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
                                                No users found
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
                                                    <div className="flex items-center gap-2">
                                                        {user.account_type?.type === 'Business' ? <Building size={14} className="text-blue-500" /> : <User size={14} className="text-green-500" />}
                                                        <span className="capitalize text-gray-700 dark:text-gray-300">{user.account_type?.type || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        user.status === 'blocked' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => toggleStatus(user)}
                                                            className={`p-1.5 rounded hover:bg-gray-100 transition dark:hover:bg-slate-800 ${user.status === 'active' ? 'text-red-500' : 'text-green-500'}`}
                                                            title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                                                        >
                                                            {user.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                                        </button>

                                                        {activeTab === 'deleted' ? (
                                                            <button
                                                                onClick={() => handleRestoreClick(user)}
                                                                className="p-1.5 text-blue-500 rounded hover:bg-blue-50 hover:text-blue-600 transition dark:hover:bg-blue-900/20"
                                                                title="Restore User"
                                                            >
                                                                <RotateCcw size={16} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDeleteClick(user)}
                                                                className="p-1.5 text-gray-400 rounded hover:bg-red-50 hover:text-red-500 transition dark:hover:bg-red-900/20"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t dark:border-gray-800">
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
                )}
            </div>

            {/* Delete Modal */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden dark:bg-slate-900 dark:border dark:border-gray-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 dark:bg-red-900/30 dark:text-red-500">
                                <UserX size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Delete User</h3>
                            <p className="text-gray-500 mb-6 dark:text-gray-400 text-sm">
                                Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">{userToDelete.name}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setUserToDelete(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                                >
                                    {loading ? 'Deleting...' : 'Delete User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Restore Modal */}
            {userToRestore && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden dark:bg-slate-900 dark:border dark:border-gray-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 dark:bg-blue-900/30 dark:text-blue-500">
                                <RotateCcw size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Restore User</h3>
                            <p className="text-gray-500 mb-6 dark:text-gray-400 text-sm">
                                Are you sure you want to restore <span className="font-bold text-gray-900 dark:text-white">{userToRestore.name}</span>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setUserToRestore(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRestore}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                >
                                    {loading ? 'Restoring...' : 'Restore User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
