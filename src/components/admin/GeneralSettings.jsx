
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Settings, Plus, Edit, Trash2, X, Save, AlertCircle, CheckCircle } from 'lucide-react';

const GeneralSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });

    // Create/Edit Modal State helooeoeo
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [saving, setSaving] = useState(false);
    const [currentSetting, setCurrentSetting] = useState({
        id: null,
        label_alias: '',
        value: '',
        status: true
    });

    const fetchSettings = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get('https://test.trippldee.com/next/api/admin-eatery-subscription/get-general-setting', {
                params: { page },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status) {
                setSettings(response.data.data);
                if (response.data.meta) {
                    setPagination({
                        current_page: response.data.meta.current_page,
                        last_page: response.data.meta.last_page,
                        total: response.data.meta.total,
                        per_page: response.data.meta.per_page
                    });
                }
            } else {
                toast.error(response.data.message || 'Failed to fetch settings');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchSettings(newPage);
        }
    };

    const handleCreateClick = () => {
        setModalMode('create');
        setCurrentSetting({
            id: null,
            label_alias: '',
            value: JSON.stringify({
                plan: "free",
                label: "Free Subscription",
                validity: 5
            }, null, 2), // Pre-fill with the example structure
            status: true
        });
        setShowModal(true);
    };

    const handleEditClick = (setting) => {
        setModalMode('edit');
        // Check if value is object or string to format correctly in textarea
        let formattedValue = setting.value;
        if (typeof setting.value === 'object' && setting.value !== null) {
            formattedValue = JSON.stringify(setting.value, null, 2);
        }

        setCurrentSetting({
            id: setting.id,
            label_alias: setting.label_alias || '',
            value: formattedValue,
            status: setting.status
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('admin_token');

            // Try to parse value if it looks like JSON
            let payloadValue = currentSetting.value;
            try {
                payloadValue = JSON.parse(currentSetting.value);
            } catch (err) {
                // Keep as string if not valid JSON
            }

            const payload = {
                value: payloadValue,
                status: currentSetting.status === 'true' || currentSetting.status === true
            };

            // Include ID for updates if available
            if (currentSetting.id) {
                payload.id = currentSetting.id;
            }

            // Include label_alias if provided
            if (currentSetting.label_alias) {
                payload.label_alias = currentSetting.label_alias;
            }

            const response = await axios.post('https://test.trippldee.com/next/api/admin-eatery-subscription/create-or-update', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status) {
                toast.success(response.data.message || (modalMode === 'create' ? 'Setting created successfully' : 'Setting updated successfully'));
                setShowModal(false);
                fetchSettings(pagination.current_page);
            } else {
                toast.error(response.data.message || 'Failed to save setting');
            }
        } catch (error) {
            console.error('Error saving setting:', error);
            const msg = error.response?.data?.message || 'Error saving setting';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const renderValue = (val) => {
        if (typeof val === 'object' && val !== null) {
            return (
                <pre className="text-xs bg-gray-50 dark:bg-slate-800 p-2 rounded border border-gray-100 dark:border-gray-700 overflow-x-auto max-w-xs">
                    {JSON.stringify(val, null, 2)}
                </pre>
            );
        }
        return <span className="text-gray-900 dark:text-white text-sm break-all">{val}</span>;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="text-orange-600" size={24} />
                        General Settings
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure global application settings and subscription details.</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-orange-600/20"
                >
                    <Plus size={18} />
                    Create Setting
                </button>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
                <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold dark:bg-slate-800 dark:text-gray-300">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Label Alias</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Updated At</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2" />
                                            Loading settings...
                                        </div>
                                    </td>
                                </tr>
                            ) : settings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No settings found.
                                    </td>
                                </tr>
                            ) : (
                                settings.map((setting) => (
                                    <tr
                                        key={setting.id}
                                        className="bg-white hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-gray-300"
                                    >
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                                            #{setting.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {setting.label_alias || <span className="italic text-gray-400">None</span>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderValue(setting.value)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${setting.status
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {setting.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                                            {new Date(setting.updated_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleEditClick(setting)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex justify-between items-center pt-4 border-t dark:border-gray-800 mt-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing page <span className="font-medium">{pagination.current_page}</span> of <span className="font-medium">{pagination.last_page}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-slate-800"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-slate-800"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Settings size={20} className="text-orange-600" />
                                {modalMode === 'create' ? 'Create Setting' : 'Edit Setting'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="settingForm" onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Label Alias <span className="text-gray-400 font-normal">(Key)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={currentSetting.label_alias}
                                        onChange={(e) => setCurrentSetting({ ...currentSetting, label_alias: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all placeholder-gray-400"
                                        placeholder="e.g., free-subscription"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Unique identifier for this setting.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Value <span className="text-gray-400 font-normal">(JSON or Text)</span>
                                    </label>
                                    <textarea
                                        value={currentSetting.value}
                                        onChange={(e) => setCurrentSetting({ ...currentSetting, value: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all font-mono text-sm h-40"
                                        placeholder='{"plan": "free", "label": "Free Subscription", "validity": 5}'
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={currentSetting.status === true || currentSetting.status === 'true'}
                                                onChange={() => setCurrentSetting({ ...currentSetting, status: true })}
                                                className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">Active</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={currentSetting.status === false || currentSetting.status === 'false'}
                                                onChange={() => setCurrentSetting({ ...currentSetting, status: false })}
                                                className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">Inactive</span>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 dark:bg-slate-800/50 dark:border-gray-800 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-slate-800"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="settingForm"
                                className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Setting
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralSettings;
