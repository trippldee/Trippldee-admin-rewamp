import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, MapPin, Phone, Mail, Star, Clock, Info, ChevronLeft, ChevronRight, Store, Eye, X, FileText, Trash2, Edit, Plus, Upload, CheckSquare, Square } from 'lucide-react';

const AdminWebEatery = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [eateries, setEateries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });

    // View Modal State
    const [viewEatery, setViewEatery] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // Delete Modal State
    const [eateryToDelete, setEateryToDelete] = useState(null);

    // Add/Edit Modal State
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [currentEatery, setCurrentEatery] = useState(getInitialEateryState());

    function getInitialEateryState() {
        return {
            eatery_name: '',
            eatery_alias: '',
            organization_alias: 'org.elite_resto', // Default or fetch
            address: '',
            pincode: '',
            email: '',
            phone_number: '',
            country: 'India',
            latitude: '',
            longitude: '',
            gst_number: '',
            gst_certificate: null,
            fssai_number: '',
            fssai_certificate: null,
            fssai_expires_at: '',
            available_order_types: [], // delivery, pick_up, reservation, dining
            available_payment_options: [], // online, offline
            working_hours: [
                { day: 'wk.monday', start_time: '09:00 AM', end_time: '10:00 PM' },
                { day: 'wk.tuesday', start_time: '09:00 AM', end_time: '10:00 PM' },
                { day: 'wk.wednesday', start_time: '09:00 AM', end_time: '10:00 PM' },
                { day: 'wk.thursday', start_time: '09:00 AM', end_time: '10:00 PM' },
                { day: 'wk.friday', start_time: '09:00 AM', end_time: '10:00 PM' },
                { day: 'wk.saturday', start_time: '09:00 AM', end_time: '10:00 PM' },
                { day: 'wk.sunday', start_time: '09:00 AM', end_time: '10:00 PM' }
            ],
            description: '',
            first_order_discount: '0',
            eatery_profile_image: null,
            eatery_cover_image: null,
            owned_by: '',
            amenities: [],
            food_category_alias: '',
            cuisine: [],
            upi_id: '',
            dining_cleaning_time: '00:15:00',
            reservation_advance_amount: '0',
            reservation_advance_percentage: '0',
            reservation_cleaning_time: '00:15:00',
            delivery_available_radius: '10',
            delivery_charges_per_km: '0',
            // Simple structure for flat fields, handling nested charges later
        };
    }

    const fetchEateries = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await axios.get('https://test.trippldee.com/next/api/admin-web-eatery/get-all-eateries', {
                params: {
                    page: page,
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status) {
                setEateries(response.data.data);
                if (response.data.meta) {
                    setPagination({
                        current_page: response.data.meta.current_page,
                        last_page: response.data.meta.last_page,
                        total: response.data.meta.total,
                        per_page: response.data.meta.per_page
                    });
                }
            } else {
                toast.error(response.data.message || 'Failed to fetch eateries');
            }
        } catch (error) {
            console.error('Error fetching admin eateries:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired or unauthorized. Please login again.');
            } else {
                toast.error('Error loading data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEateries(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchEateries(newPage);
        }
    };

    const handleViewClick = (eatery) => {
        setViewEatery(eatery);
        setShowViewModal(true);
    };

    const handleDeleteClick = (eatery) => {
        setEateryToDelete(eatery);
    };

    const confirmDelete = async () => {
        if (!eateryToDelete) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.delete('https://test.trippldee.com/next/api/admin-web-eatery/delete', {
                headers: { Authorization: `Bearer ${token}` },
                data: { eatery_alias: eateryToDelete.alias }
            });

            if (response.data.success || response.data.status) {
                toast.success(response.data.message || 'Eatery deleted successfully');
                setEateryToDelete(null);
                fetchEateries(pagination.current_page);
            } else {
                toast.error(response.data.message || 'Failed to delete eatery');
            }
        } catch (error) {
            console.error('Error deleting eatery:', error);
            toast.error('Error deleting eatery');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (eatery, newStatus) => {
        try {
            const token = localStorage.getItem('admin_token');
            // Optimistic update
            setEateries(eateries.map(e => e.alias === eatery.alias ? { ...e, status: newStatus } : e));

            const response = await axios.patch('https://test.trippldee.com/next/api/admin-web-eatery/eatery/status',
                { eatery_alias: eatery.alias, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.status || response.data.success) {
                toast.success(`Eatery status updated to ${newStatus}`);
            } else {
                // Revert on failure
                toast.error('Failed to update status');
                fetchEateries(pagination.current_page);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status');
            fetchEateries(pagination.current_page); // Revert
        }
    };

    // --- Form Handlers ---

    const handleAddClick = () => {
        setIsEditing(false);
        setCurrentEatery(getInitialEateryState());
        setShowAddEditModal(true);
    };

    const handleEditClick = (eatery) => {
        setIsEditing(true);
        // Map eatery data to form state
        // Note: Real API response structure might differ slightly from what's needed for the update payload
        // This mapping is a best-effort based on available info.
        setCurrentEatery({
            eatery_name: eatery.branch_name || '',
            eatery_alias: eatery.alias || '',
            organization_alias: eatery.organization?.alias || 'org.elite_resto',
            address: eatery.address || '',
            pincode: eatery.pincode || '',
            email: eatery.email || '',
            phone_number: eatery.phone_number || '',
            country: 'India', // Default or fetch
            latitude: eatery.latitude || '',
            longitude: eatery.longitude || '',
            gst_number: eatery.gst_number || '',
            gst_certificate: null, // Don't show old file object
            fssai_number: eatery.fssai_number || '',
            fssai_certificate: null,
            fssai_expires_at: eatery.fssai_expires_at || '',
            available_order_types: eatery.order_types_details?.map(ot => ot.alias) || [], // Assuming alias used
            available_payment_options: eatery.available_payment_option || [],
            working_hours: eatery.working_hours || getInitialEateryState().working_hours,
            description: eatery.description || '',
            first_order_discount: eatery.first_order_discount || '0',
            eatery_profile_image: null,
            eatery_cover_image: null,
            owned_by: eatery.owned_by?.referral_code || '', // Assuming referral code
            amenities: eatery.amenities?.alias ? [eatery.amenities.alias] : [], // Multi-select usually
            food_category_alias: eatery.food_category?.alias || '',
            cuisine: eatery.cuisines?.map(c => c.alias) || [],
            upi_id: eatery.upi_id || '',
            // Populate nested defaults if missing
            dining_cleaning_time: '00:15:00',
            reservation_advance_amount: '0',
            reservation_advance_percentage: '0',
            reservation_cleaning_time: '00:15:00',
            delivery_available_radius: '10',
            delivery_charges_per_km: '0',
        });
        setShowAddEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentEatery(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setCurrentEatery(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleCheckboxArrayChange = (name, value) => {
        setCurrentEatery(prev => {
            const currentArray = prev[name] || [];
            if (currentArray.includes(value)) {
                return { ...prev, [name]: currentArray.filter(item => item !== value) };
            } else {
                return { ...prev, [name]: [...currentArray, value] };
            }
        });
    };

    const handleWorkingHourChange = (index, field, value) => {
        const updatedHours = [...currentEatery.working_hours];
        updatedHours[index] = { ...updatedHours[index], [field]: value };
        setCurrentEatery(prev => ({ ...prev, working_hours: updatedHours }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        const formData = new FormData();
        // Append all fields manually to match the structure
        if (isEditing) formData.append('eatery_alias', currentEatery.eatery_alias);
        formData.append('eatery_name', currentEatery.eatery_name);
        formData.append('organization_alias', currentEatery.organization_alias);
        formData.append('address', currentEatery.address);
        formData.append('pincode', currentEatery.pincode);
        formData.append('email', currentEatery.email);
        formData.append('phone_number', currentEatery.phone_number);
        formData.append('country', currentEatery.country);
        formData.append('latitude', currentEatery.latitude);
        formData.append('longitude', currentEatery.longitude);
        formData.append('description', currentEatery.description);
        formData.append('first_order_discount', currentEatery.first_order_discount);
        formData.append('owned_by', currentEatery.owned_by);
        formData.append('upi_id', currentEatery.upi_id);
        formData.append('food_category_alias', currentEatery.food_category_alias);

        // GST & FSSAI
        if (currentEatery.gst_number) formData.append('gst_number', currentEatery.gst_number);
        if (currentEatery.gst_certificate) formData.append('gst_certificate', currentEatery.gst_certificate);
        if (currentEatery.fssai_number) formData.append('fssai_number', currentEatery.fssai_number);
        if (currentEatery.fssai_certificate) formData.append('fssai_certificate', currentEatery.fssai_certificate);
        if (currentEatery.fssai_expires_at) formData.append('fssai_expires_at', currentEatery.fssai_expires_at);

        // Images
        if (currentEatery.eatery_profile_image) formData.append('eatery_profile_image', currentEatery.eatery_profile_image);
        if (currentEatery.eatery_cover_image) formData.append('eatery_cover_image', currentEatery.eatery_cover_image);

        // Arrays
        currentEatery.available_order_types.forEach((type, index) => formData.append(`available_order_types[${index}]`, type));
        currentEatery.available_payment_options.forEach((opt, index) => formData.append(`available_payment_options[${index}]`, opt));
        currentEatery.amenities.forEach((amen, index) => formData.append(`amenities[${index}]`, amen));
        currentEatery.cuisine.forEach((cucn, index) => formData.append(`cuisine[${index}]`, cucn));

        // Working Hours
        currentEatery.working_hours.forEach((wh, index) => {
            formData.append(`working_hours[${index}][day]`, wh.day);
            formData.append(`working_hours[${index}][start_time]`, wh.start_time);
            formData.append(`working_hours[${index}][end_time]`, wh.end_time);
        });

        // Nested Objects (Simplified for now, as full structure is massive)
        formData.append('reservation[advance_amount]', currentEatery.reservation_advance_amount);
        formData.append('reservation[advance_percentage_of_order]', currentEatery.reservation_advance_percentage);
        formData.append('reservation[cleaning_time]', currentEatery.reservation_cleaning_time);
        formData.append('dining[cleaning_time]', currentEatery.dining_cleaning_time);
        formData.append('delivery[available_radius]', currentEatery.delivery_available_radius);
        formData.append('delivery[charges_per_km]', currentEatery.delivery_charges_per_km);

        // Hardcoded extras for demo as requested by screenshots, usually dynamic
        formData.append('delivery[extra_charges][offline][0][type]', 'handling charge');
        formData.append('delivery[extra_charges][offline][0][amount]', '7.00');
        formData.append('pick_up[extra_charges][offline][0][type]', 'handling charge');
        formData.append('pick_up[extra_charges][offline][0][amount]', '10.00');


        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.post('https://test.trippldee.com/next/api/admin-web-eatery/create-or-update', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success || response.data.status) {
                toast.success(isEditing ? 'Eatery updated successfully' : 'Eatery created successfully');
                setShowAddEditModal(false);
                fetchEateries(pagination.current_page);
            } else {
                toast.error(response.data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Error submitting form');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300">
            <div className="p-4 md:p-6">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Store className="text-orange-600" size={24} />
                            Admin Web Eatery
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and view all registered eateries.</p>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-orange-600/20"
                    >
                        <Plus size={18} />
                        Create Eatery
                    </button>
                </div>

                {/* Search */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search eateries..."
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
                                <th className="px-6 py-4">Eatery Details</th>
                                <th className="px-6 py-4">Attributes</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Loading eateries...
                                    </td>
                                </tr>
                            ) : eateries.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No eateries found
                                    </td>
                                </tr>
                            ) : (
                                eateries.map((eatery) => (
                                    <tr
                                        key={eatery.alias}
                                        className="bg-white hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-gray-300"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 dark:bg-slate-700 border border-gray-200 dark:border-gray-700">
                                                    {eatery.eatery_profile_image ? (
                                                        <img src={eatery.eatery_profile_image} alt={eatery.branch_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Store size={20} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{eatery.branch_name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{eatery.alias}</div>
                                                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">{eatery.organization?.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 text-xs">
                                                <div className="flex items-center gap-1.5" title="Category">
                                                    <span className="p-1 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {eatery.food_category?.category || 'No Category'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                                    <span className="font-medium">{eatery.average_rating || '0.00'}</span>
                                                    <span className="text-gray-400">({eatery.total_reviews})</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-300">
                                                    <Mail size={12} className="text-gray-400" />
                                                    {eatery.email || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                    <Phone size={12} className="text-gray-400" />
                                                    {eatery.country_code} {eatery.phone_number}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={eatery.address}>
                                                    <MapPin size={12} className="text-gray-400 shrink-0" />
                                                    <span className="truncate">{eatery.address}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-3">
                                                <select
                                                    value={eatery.status || 'inactive'}
                                                    onChange={(e) => handleStatusChange(eatery, e.target.value)}
                                                    className={`px-2 py-1 rounded text-xs font-semibold border focus:outline-none focus:ring-1 focus:ring-opacity-50 cursor-pointer ${eatery.status === 'approved'
                                                            ? 'bg-green-100 text-green-700 border-green-200 focus:ring-green-500 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                                            : eatery.status === 'blocked'
                                                                ? 'bg-red-100 text-red-700 border-red-200 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                                                : eatery.status === 'under_review'
                                                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200 focus:ring-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                                                    : 'bg-gray-100 text-gray-700 border-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                        }`}
                                                >
                                                    <option value="under_review">Under Review</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="blocked">Blocked</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>

                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${eatery.is_open
                                                        ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                                        : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                                        }`}>
                                                        {eatery.is_open ? 'Open' : 'Closed'}
                                                    </span>
                                                    {eatery.fssai_status === 'expired' && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800">
                                                            FSSAI Exp
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewClick(eatery)}
                                                    className="p-1.5 text-green-500 hover:bg-green-50 rounded transition-colors dark:hover:bg-green-900/20"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(eatery)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors dark:hover:bg-blue-900/20"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(eatery)}
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
            </div>

            {/* View Details Modal */}
            {showViewModal && viewEatery && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Store size={20} className="text-orange-600" />
                                Eatery Details
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
                            <div className="space-y-6">
                                {/* Top Profile Section */}
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="w-full sm:w-1/3 space-y-4">
                                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border dark:border-gray-700">
                                            <img src={viewEatery.eatery_profile_image || 'https://via.placeholder.com/300'} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                        {viewEatery.qr_code && (
                                            <div className="bg-white p-2 rounded-xl border border-dashed border-gray-200 shadow-sm dark:bg-slate-800 dark:border-gray-700">
                                                <img src={viewEatery.qr_code} alt="QR Code" className="w-full h-auto object-contain" />
                                                <p className="text-[10px] text-center text-gray-400 mt-1 uppercase font-bold tracking-wider">Eatery QR</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{viewEatery.branch_name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-bold dark:bg-orange-900/30 dark:text-orange-400">
                                                    {viewEatery.alias}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900/30 dark:text-blue-400">
                                                    {viewEatery.organization?.type}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                                            {viewEatery.description || 'No description available.'}
                                        </p>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                                                <MapPin size={16} className="text-orange-500 mt-0.5 shrink-0" />
                                                <div className="text-sm">
                                                    <p className="font-semibold text-gray-900 dark:text-white">Address</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{viewEatery.address}</p>
                                                    <p className="text-gray-500 text-xs mt-1">Pin: {viewEatery.pincode}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                                                <ContactItem icon={Phone} label="Phone" value={`${viewEatery.country_code} ${viewEatery.phone_number}`} verified={viewEatery.phone_number_verified} />
                                                <div className="w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                                                <ContactItem icon={Mail} label="Email" value={viewEatery.email} verified={viewEatery.email_verified} />
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <h5 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                                                <Info size={14} className="text-blue-500" />
                                                Additional Info
                                            </h5>
                                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Food Category:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-white">{viewEatery.food_category?.category}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Amenity:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-white">{viewEatery.amenities?.amenity || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Reservation:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-white">{viewEatery.is_reservation_available ? 'Available' : 'No'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">FSSAI Status:</span>
                                                    <span className={`ml-1 font-medium ${viewEatery.fssai_status === 'expired' ? 'text-red-500' : 'text-green-500'}`}>
                                                        {viewEatery.fssai_status || 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Payment:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                        {viewEatery.available_payment_option?.join(', ') || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                {viewEatery.fssai_certificate && (
                                                    <a href={viewEatery.fssai_certificate} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
                                                        <FileText size={12} /> View FSSAI Certificate
                                                    </a>
                                                )}
                                                {viewEatery.gst_certificate && (
                                                    <a href={viewEatery.gst_certificate} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
                                                        <FileText size={12} /> View GST Certificate
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Working Hours */}
                                {viewEatery.working_hours && viewEatery.working_hours.length > 0 && (
                                    <div className="border-t pt-4 dark:border-gray-800">
                                        <h5 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Clock size={16} className="text-gray-500" />
                                            Working Hours
                                        </h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {viewEatery.working_hours.map((wh, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-gray-50 dark:bg-slate-800/50">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{wh.day}</span>
                                                    <span className="text-gray-500 dark:text-gray-400">{wh.opening_time} - {wh.closing_time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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


            {/* Add / Edit Eatery Modal */}
            {showAddEditModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
                                    {isEditing ? <Edit size={18} /> : <Plus size={18} />}
                                </span>
                                {isEditing ? 'Edit Eatery' : 'Create New Eatery'}
                            </h3>
                            <button
                                onClick={() => setShowAddEditModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="eateryForm" onSubmit={handleFormSubmit} className="space-y-6">
                                <section>
                                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Eatery Name" name="eatery_name" value={currentEatery.eatery_name} onChange={handleInputChange} required />
                                        <InputField label="Organization Alias" name="organization_alias" value={currentEatery.organization_alias} onChange={handleInputChange} required />
                                        <InputField label="Owned By (User Code)" name="owned_by" value={currentEatery.owned_by} onChange={handleInputChange} />
                                        <InputField label="Food Category Alias" name="food_category_alias" value={currentEatery.food_category_alias} onChange={handleInputChange} />
                                        <InputField label="Description" name="description" value={currentEatery.description} onChange={handleInputChange} className="md:col-span-2" />
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Contact & Location</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Email" type="email" name="email" value={currentEatery.email} onChange={handleInputChange} required />
                                        <InputField label="Phone Number" name="phone_number" value={currentEatery.phone_number} onChange={handleInputChange} required />
                                        <InputField label="Address" name="address" value={currentEatery.address} onChange={handleInputChange} required className="md:col-span-2" />
                                        <InputField label="Pincode" name="pincode" value={currentEatery.pincode} onChange={handleInputChange} required />
                                        <InputField label="Country" name="country" value={currentEatery.country} onChange={handleInputChange} />
                                        <InputField label="Latitude" name="latitude" value={currentEatery.latitude} onChange={handleInputChange} />
                                        <InputField label="Longitude" name="longitude" value={currentEatery.longitude} onChange={handleInputChange} />
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Legal & Compliance</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="GST Number" name="gst_number" value={currentEatery.gst_number} onChange={handleInputChange} />
                                        <FileInputField label="GST Certificate" name="gst_certificate" onChange={handleFileChange} />
                                        <InputField label="FSSAI Number" name="fssai_number" value={currentEatery.fssai_number} onChange={handleInputChange} />
                                        <FileInputField label="FSSAI Certificate" name="fssai_certificate" onChange={handleFileChange} />
                                        <InputField label="FSSAI Expiry" type="date" name="fssai_expires_at" value={currentEatery.fssai_expires_at} onChange={handleInputChange} />
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Operations</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Types</label>
                                            <div className="flex gap-4 flex-wrap">
                                                {['delivery', 'pick_up', 'reservation', 'dining'].map(type => (
                                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={currentEatery.available_order_types.includes(type)}
                                                            onChange={() => handleCheckboxArrayChange('available_order_types', type)}
                                                            className="rounded text-orange-600 focus:ring-orange-500 dark:bg-slate-700 dark:border-gray-600"
                                                        />
                                                        <span className="text-sm dark:text-gray-300 capitalize">{type.replace('_', ' ')}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Options</label>
                                            <div className="flex gap-4 flex-wrap">
                                                {['online', 'offline'].map(opt => (
                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={currentEatery.available_payment_options.includes(opt)}
                                                            onChange={() => handleCheckboxArrayChange('available_payment_options', opt)}
                                                            className="rounded text-orange-600 focus:ring-orange-500 dark:bg-slate-700 dark:border-gray-600"
                                                        />
                                                        <span className="text-sm dark:text-gray-300 capitalize">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Images</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FileInputField label="Profile Image" name="eatery_profile_image" onChange={handleFileChange} />
                                        <FileInputField label="Cover Image" name="eatery_cover_image" onChange={handleFileChange} />
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Working Hours</h4>
                                    <div className="space-y-2">
                                        {currentEatery.working_hours.map((wh, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <span className="w-24 text-sm font-medium dark:text-gray-300 capitalize">{wh.day.replace('wk.', '')}</span>
                                                <input
                                                    type="time"
                                                    // This is a simplification; real UI might use a time picker or text input for "10:00 AM"
                                                    // For now assuming user enters text manually or browser handles it if type="text"
                                                    // Given the API expects "11:00 AM", text input is safer unless we parse
                                                    className="border rounded px-2 py-1 text-sm dark:bg-slate-800 dark:border-gray-700"
                                                    value={wh.start_time}
                                                    onChange={(e) => handleWorkingHourChange(idx, 'start_time', e.target.value)}
                                                />
                                                <span className="text-gray-500">-</span>
                                                <input
                                                    type="text"
                                                    className="border rounded px-2 py-1 text-sm dark:bg-slate-800 dark:border-gray-700"
                                                    value={wh.end_time}
                                                    onChange={(e) => handleWorkingHourChange(idx, 'end_time', e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </form>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 dark:bg-slate-800/50 dark:border-gray-800 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAddEditModal(false)}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-slate-800"
                                disabled={formLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="eateryForm"
                                className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={formLoading}
                            >
                                {formLoading ? 'Saving...' : (isEditing ? 'Update Eatery' : 'Create Eatery')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {eateryToDelete && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100 dark:bg-slate-900 dark:border dark:border-gray-800">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 dark:bg-red-900/30 dark:text-red-500">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Delete Eatery</h3>
                            <p className="text-gray-500 mb-6 dark:text-gray-400">
                                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{eateryToDelete.branch_name}"</span>?
                                <br /><span className="text-xs text-red-500 mt-1 block">This action cannot be undone.</span>
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEateryToDelete(null)}
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
        </div>
    );
};

const ContactItem = ({ icon: Icon, label, value, verified }) => (
    <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
            <Icon size={12} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
            {verified && <span className="text-[10px] text-green-600 font-bold ml-auto">VERIFIED</span>}
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={value}>{value}</p>
    </div>
);

const InputField = ({ label, className = "", ...props }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-800 dark:border-gray-700 dark:text-white transition-all"
            {...props}
        />
    </div>
);

const FileInputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <div className="relative">
            <input
                type="file"
                className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 dark:bg-slate-800 dark:border-gray-700 dark:hover:bg-slate-700 transition-all text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                {...props}
            />
        </div>
    </div>
);

export default AdminWebEatery;
