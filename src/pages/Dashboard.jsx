
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Database, Settings, User, ChevronLeft, ChevronRight, Calculator, Calendar, Bell, ChevronDown, Utensils, Cloud, FileText, CreditCard, Ticket, BarChart3, Search, CheckCircle, Menu, X, Scale, ChefHat, Tag, Store, Sliders, Clock, AlertCircle } from 'lucide-react';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import RoleManagement from '../components/admin/RoleManagement';
import BMI from '../components/admin/BMI';
import UserManagement from '../components/admin/UserManagement';
import PermissionManagement from '../components/admin/PermissionManagement';
import QuickInfo from '../components/dashboard/QuickInfo';
import AnnualOverview from '../components/dashboard/AnnualOverview';
import PerformanceCard from '../components/dashboard/PerformanceCard';
import RevenueCards from '../components/dashboard/RevenueCards';
import Notifications from '../components/dashboard/Notifications';
import RecentActivity from '../components/dashboard/RecentActivity';
import PostManagement from '../components/admin/PostManagement';
import RecipeManagement from '../components/admin/RecipeManagement';
import OfferManagement from '../components/admin/OfferManagement';
import SubscriptionPlans from '../components/admin/SubscriptionPlans';
import AdminWebUser from '../components/admin/AdminWebUser';
import AdminWebEatery from '../components/admin/AdminWebEatery';
import StaticPages from '../components/admin/StaticPages';
import GeneralSettings from '../components/admin/GeneralSettings';
import AllNotifications from '../components/dashboard/AllNotifications';
import AllActivity from '../components/dashboard/AllActivity';
import Tickets from '../components/admin/Tickets';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('Dashboard');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('isDarkMode');
        // Default to true if not set (null), otherwise respect the saved value
        return savedMode !== 'false';
    });
    const [appSettings, setAppSettings] = useState({ logo: '', company_name: '' });
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const profileRef = React.useRef(null);
    const notificationRef = React.useRef(null);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleSubMenu = (label) => {
        setExpandedMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    // Handle outside click to close profile dropdown
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Persist Dark Mode preference
    React.useEffect(() => {
        localStorage.setItem('isDarkMode', isDarkMode);
    }, [isDarkMode]);

    // Fetch App Settings
    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get('https://test.trippldee.com/next/api/app/settings');
                if (response.data.success) {
                    setAppSettings(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch app settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const handleLogout = () => {
        setIsProfileOpen(false);
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        setLoading(true);
        try {
            await axios.get('https://test.trippldee.com/next/api/admin-auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            setShowLogoutConfirm(false);
            toast.success('Logged out successfully!');
            navigate('/');
            setLoading(false);
        }
    };

    const sidebarItems = [
        { icon: LayoutDashboard, label: 'Dashboard' },
        {
            icon: Settings,
            label: 'Administration',
            subItems: [
                { label: 'Role Management' },
                { label: 'Permission Management' }
            ]
        },

        {
            icon: User,
            label: 'Users',
            subItems: [
                { label: 'Users' },
                { label: 'Admin Web User' },
                { label: 'Chef' }
            ]
        },
        { icon: Store, label: 'Admin Web Eatery' },
        { icon: Utensils, label: 'Restaurants' },
        { icon: Tag, label: 'Eatery Offers' },
        { icon: Cloud, label: 'Cloud Kitchen' },
        { icon: FileText, label: 'Post Management' },
        { icon: FileText, label: 'Static Pages' },
        { icon: Ticket, label: 'Tickets' },
        { icon: ChefHat, label: 'Recipe Management' },
        {
            icon: CreditCard,
            label: 'Subscription',
            subItems: [
                { label: 'Plans' }
            ]
        },

        { icon: BarChart3, label: 'Analytics' },
        { icon: Scale, label: 'BMI' },
        { icon: Sliders, label: 'General Settings' },
    ];

    return (
        <div className={`min-h-screen flex font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-[#0f172a] text-gray-200' : 'bg-white text-gray-800'}`}>
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out flex flex-col border-r h-full
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
                    w-64
                    ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-100'}
                `}
            >
                {/* Sidebar Header */}
                <div className={`h-20 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
                    {(!isSidebarCollapsed || isMobileMenuOpen) && (
                        <div className="flex items-center gap-2">
                            {appSettings.logo ? (
                                <img
                                    src={appSettings.logo}
                                    alt="Logo"
                                    className="w-8 h-8 object-contain"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-white text-sm">TD</span>
                                </div>
                            )}
                            <span className={`text-xl font-bold tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {appSettings.company_name || 'Admin'}
                            </span>
                        </div>
                    )}

                    <div className="ml-auto flex items-center">
                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="md:hidden text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <X size={20} />
                        </button>

                        {/* Desktop Collapse Button */}
                        {!isSidebarCollapsed && (
                            <button
                                onClick={() => setIsSidebarCollapsed(true)}
                                className="hidden md:block text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                    </div>
                    {isSidebarCollapsed && (
                        <button
                            onClick={() => setIsSidebarCollapsed(false)}
                            className="mx-auto text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>

                <nav className={`flex-1 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${isSidebarCollapsed ? 'px-2 py-2' : 'px-4 py-2'}`}>
                    {sidebarItems.map((item, index) => (
                        <React.Fragment key={index}>
                            <button
                                onClick={() => {
                                    if (item.subItems) {
                                        toggleSubMenu(item.label);
                                        if (isSidebarCollapsed) setIsSidebarCollapsed(false);
                                    } else {
                                        setActiveSection(item.label);
                                    }
                                }}
                                className={`w-full flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group relative ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} ${activeSection === item.label
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                    : isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={20} className="shrink-0" />
                                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                                    <>
                                        <span className="font-medium text-[15px] flex-1 text-left">{item.label}</span>
                                        {item.subItems && (
                                            <ChevronDown
                                                size={16}
                                                className={`transition-transform duration-200 ${expandedMenus[item.label] ? 'rotate-180' : ''}`}
                                            />
                                        )}
                                    </>
                                )}

                                {/* Hover tooltip for collapsed state */}
                                {isSidebarCollapsed && (
                                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                                        {item.label}
                                    </div>
                                )}

                                {/* Active indicator dot for red theme in image 1 */}
                                {activeSection === item.label && (!isSidebarCollapsed || isMobileMenuOpen) && !item.subItems && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />
                                )}
                            </button>

                            {/* Sub Items */}
                            {(!isSidebarCollapsed || isMobileMenuOpen) && item.subItems && expandedMenus[item.label] && (
                                <div className="ml-10 space-y-1 relative">
                                    {/* Vertical line connector */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-px ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} -ml-4`}></div>

                                    {item.subItems.map((subItem, subIndex) => (
                                        <button
                                            key={subIndex}
                                            onClick={() => setActiveSection(subItem.label)}
                                            className={`w-full flex items-center gap-2 py-2 px-2 text-sm transition-colors rounded-lg relative ${activeSection === subItem.label
                                                ? 'text-orange-600 bg-orange-50 font-medium'
                                                : isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                        >
                                            {activeSection === subItem.label && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-[18px] w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                            )}
                                            <span className="text-lg leading-none select-none opacity-50">›</span>
                                            {subItem.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </nav>

                {/* Logout visible at the bottom */}
                <div className={`p-4 border-t mt-auto ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className={`flex items-center gap-3 w-full py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 group ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'}`}
                    >
                        <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
                        {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 flex flex-col min-w-0 ${isDarkMode ? 'bg-[#1e293b]/30' : 'bg-gray-50/50'}`}>
                {/* Header from Image 2 */}
                <header className={`h-16 md:h-20 border-b px-4 md:px-8 flex items-center justify-between shadow-sm z-10 ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-orange-600 tracking-tight truncate">{activeSection}</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Date Picker Mock */}
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm hover:border-orange-200 transition-colors cursor-pointer">
                            <Calendar size={16} className="text-gray-400" />
                            <span>13/02/2025 - 24/03/2025</span>
                        </div>

                        {/* Country Selector */}
                        <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-sm font-semibold shadow-lg shadow-orange-600/20 transition-all active:scale-95">
                            <span>Choose Country</span>
                            <ChevronDown size={16} />
                        </button>

                        {/* Notification */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors outline-none"
                            >
                                <Bell size={24} />
                                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                            </button>

                            {/* Notification Dropdown */}
                            {isNotificationOpen && (
                                <div className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl shadow-xl border overflow-hidden z-50 ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-100'}`}>
                                    <div className={`px-4 py-3 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                                        <button className="text-xs font-medium text-orange-600 hover:text-orange-700">Mark all as read</button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {[
                                            { id: 1, title: 'New Order Received', desc: 'Order #ORD-2025-001 from Delicious Bites', time: '2 min ago', type: 'order' },
                                            { id: 2, title: 'Restaurant Approval Pending', desc: 'Spicy Grill House requested approval', time: '1 hour ago', type: 'alert' },
                                            { id: 3, title: 'Subscription Expiring', desc: 'Golden Dragon subscription expires in 3 days', time: '5 hours ago', type: 'warning' },
                                            { id: 4, title: 'New User Registration', desc: 'User John Doe registered as a Chef', time: '1 day ago', type: 'info' }
                                        ].map((item) => (
                                            <div key={item.id} className={`p-4 border-b hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex gap-3 ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'order' ? 'bg-green-100 text-green-600' :
                                                    item.type === 'alert' ? 'bg-blue-100 text-blue-600' :
                                                        item.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {item.type === 'order' ? <CheckCircle size={18} /> :
                                                        item.type === 'alert' ? <Store size={18} /> :
                                                            item.type === 'warning' ? <AlertCircle size={18} /> :
                                                                <User size={18} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-semibold mb-0.5 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.title}</p>
                                                    <p className={`text-xs mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</p>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium uppercase">
                                                        <Clock size={10} />
                                                        <span>{item.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={`p-2 border-t text-center ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                                        <button
                                            onClick={() => {
                                                setActiveSection('All Notifications');
                                                setIsNotificationOpen(false);
                                            }}
                                            className="text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors py-1"
                                        >
                                            View All Notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 pl-4 border-l border-gray-200 outline-none"
                            >
                                <div className="text-right hidden md:block">
                                    <p className={`text-sm font-bold leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name || 'Admin'}</p>
                                    <p className="text-xs text-gray-500 mt-1">Admin Role</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden ring-2 ring-gray-100 transition-all hover:ring-orange-200">
                                    {/* Placeholder for user image */}
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-bold">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                </div>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-xl border overflow-hidden z-50 ${isDarkMode ? 'bg-[#1e293b] border-orange-500/50 shadow-orange-900/20' : 'bg-orange-50 border-orange-100'}`}>
                                    <div className={`p-6 border-b ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-gradient-to-br from-orange-100 to-orange-50 border-orange-100'}`}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-16 h-16 rounded-full p-1 shadow-sm ring-1 ${isDarkMode ? 'bg-gray-800 ring-gray-700' : 'bg-white ring-orange-100'}`}>
                                                <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 font-bold text-2xl">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name || 'Admin User'}</h4>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <User size={14} />
                                                <span className="truncate">{user.email || 'admin@trippldee.com'}</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <span className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold border rounded-sm ${isDarkMode ? 'border-gray-600' : 'border-gray-400'}`}>ID</span>
                                                <span className="font-mono text-xs">{user.id || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dark Mode Toggle */}
                                    <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-800' : 'border-orange-100'}`}>
                                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsDarkMode(!isDarkMode)}>
                                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dark Mode</span>
                                            <div className={`w-11 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-orange-600' : 'bg-gray-200'}`}>
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isDarkMode ? 'left-[26px]' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center justify-center gap-2 w-full p-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 overflow-y-auto h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
                    {/* Dashboard Content Grid */}

                    {activeSection === 'Dashboard' ? (
                        <div className="space-y-6 max-w-[1600px] mx-auto">
                            {/* Top Section: Quick Info & Annual Overview */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                <div className="xl:col-span-1 h-full">
                                    <QuickInfo />
                                </div>
                                <div className="xl:col-span-2 h-full">
                                    <AnnualOverview />
                                </div>
                            </div>

                            {/* Middle Section: Performance & Side Panel */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                {/* Left Column (Performance & Activity) */}
                                <div className="xl:col-span-2 space-y-6">
                                    <PerformanceCard title="Cloud Kitchen Performance" type="cloud" />
                                    <PerformanceCard title="Restaurant Performance" type="restaurant" />
                                    <RecentActivity onViewAll={() => setActiveSection('All Activity')} />
                                </div>

                                {/* Right Column (Revenue & Notifications) */}
                                <div className="xl:col-span-1 space-y-6">
                                    <RevenueCards />
                                    <Notifications onViewAll={() => setActiveSection('All Notifications')} />
                                </div>
                            </div>
                        </div>

                    ) : activeSection === 'All Notifications' ? (
                        <AllNotifications onBack={() => setActiveSection('Dashboard')} />
                    ) : activeSection === 'All Activity' ? (
                        <AllActivity onBack={() => setActiveSection('Dashboard')} />
                    ) : activeSection === 'Tickets' ? (
                        <Tickets />
                    ) : activeSection === 'Role Management' ? (
                        <RoleManagement />
                    ) : activeSection === 'User Management' ? (
                        <UserManagement />
                    ) : activeSection === 'Users' ? (
                        <UserManagement viewMode="users" />
                    ) : activeSection === 'Deleted Users' ? (
                        <UserManagement viewMode="deleted" />
                    ) : activeSection === 'Admin Web User' ? (
                        <AdminWebUser />
                    ) : activeSection === 'Admin Web Eatery' ? (
                        <AdminWebEatery />
                    ) : activeSection === 'Permission Management' ? (
                        <PermissionManagement />
                    ) : activeSection === 'BMI' ? (
                        <BMI />
                    ) : activeSection === 'General Settings' ? (
                        <GeneralSettings />
                    ) : activeSection === 'Post Management' ? (
                        <PostManagement />
                    ) : activeSection === 'Static Pages' ? (
                        <StaticPages />
                    ) : activeSection === 'Recipe Management' ? (
                        <RecipeManagement />
                    ) : activeSection === 'Eatery Offers' ? (
                        <OfferManagement />
                    ) : activeSection === 'Plans' ? (
                        <SubscriptionPlans />
                    ) : (
                        // Placeholder for other sections
                        <div className={`flex flex-col items-center justify-center h-96 rounded-3xl shadow-sm border p-8 text-center animate-pulse ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-100'}`}>
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 text-orange-500 ${isDarkMode ? 'bg-gray-800' : 'bg-orange-100'}`}>
                                {sidebarItems.find(i => i.label === activeSection || i.subItems?.some(s => s.label === activeSection))?.icon &&
                                    React.createElement(sidebarItems.find(i => i.label === activeSection || i.subItems?.some(s => s.label === activeSection)).icon, { size: 48 })
                                }
                            </div>
                            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{activeSection} Module</h2>
                            <p className="text-gray-500 max-w-md">The {activeSection} management interface is currently under development. Check back soon for updates!</p>
                        </div>
                    )}
                </div>
            </main >

            {/* Logout Confirmation Modal */}
            {
                showLogoutConfirm && (
                    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100">
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                    <LogOut size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out</h3>
                                <p className="text-gray-500 mb-6">Are you sure you want to sign out? You will need to sign in again to access the dashboard.</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmLogout}
                                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                                    >
                                        Yes, Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Dashboard;
