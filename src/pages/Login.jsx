
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [appSettings, setAppSettings] = useState({ logo: '', company_name: '' });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
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

        // Load saved credentials
        const savedEmail = localStorage.getItem('remember_email');
        const savedPassword = localStorage.getItem('remember_password');
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('https://test.trippldee.com/next/api/admin-auth/login', {
                email,
                password
            });

            if (response.data.success) {
                // Store all main value keys in storage
                Object.keys(response.data.data).forEach(key => {
                    const value = response.data.data[key];
                    localStorage.setItem(
                        key === 'access_token' ? 'admin_token' :
                            key === 'user' ? 'admin_user' : key,
                        typeof value === 'object' ? JSON.stringify(value) : value
                    );
                });

                // Ensure specific keys we rely on are set if the loop didn't cover standard naming
                if (!localStorage.getItem('admin_token') && response.data.data.access_token) {
                    localStorage.setItem('admin_token', response.data.data.access_token);
                }
                if (!localStorage.getItem('admin_user') && response.data.data.user) {
                    localStorage.setItem('admin_user', JSON.stringify(response.data.data.user));
                }

                // Handle Remember Me
                if (rememberMe) {
                    localStorage.setItem('remember_email', email);
                    localStorage.setItem('remember_password', password);
                } else {
                    localStorage.removeItem('remember_email');
                    localStorage.removeItem('remember_password');
                }

                toast.success('Logged in successfully!');
                navigate('/dashboard');
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-gray-100">
            {/* Background Patches/Blobs - Black/White Shadow Wind */}
            {/* Premium Animated Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-gray-50/50">
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.4]"></div>

                {/* Soft Glowing Orbs - Aurora Effect */}
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gray-200/50 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-20 w-[600px] h-[600px] bg-orange-100/60 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute -bottom-40 right-20 w-[500px] h-[500px] bg-slate-200/50 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"></div>

                {/* Floating Geometric Accents (Very subtle) */}
                <div className="absolute top-1/4 right-[10%] w-4 h-4 bg-orange-400/20 rounded-full animate-float"></div>
                <div className="absolute bottom-1/3 left-[5%] w-6 h-6 bg-gray-400/20 rounded-full animate-float-delayed"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                {/* Left Side - Brand Info (Dark Navy) */}
                <div className="md:w-1/2 bg-[#0B0F1C] p-12 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            {/* Dynamic Logo from Settings */}
                            {appSettings.logo ? (
                                <img src={appSettings.logo} alt="Logo" className="w-10 h-10 object-contain" />
                            ) : (
                                <div className="flex items-center justify-center w-8 h-8 text-xs font-bold transform rounded-full bg-gradient-to-r from-orange-400 to-orange-600 -rotate-12">
                                    
                                </div>
                            )}
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                                {appSettings.company_name || 'Trippldee'}
                            </h1>
                        </div>

                        <h2 className="mb-6 text-xl font-semibold">{appSettings.company_name || 'Trippldee'}</h2>

                        <p className="max-w-xs text-sm leading-relaxed text-gray-300">
                            We aim to provide a mobilized platform for you to find 'the one' for you.
                        </p>
                    </div>

                    <div className="mt-12">
                        <p className="mb-1 text-xs text-gray-500">
                            Powered by : 2023 DDDKING NET LINE PVT. LTD
                        </p>
                        <p className="text-xs text-gray-500">
                            © 2026 Trippldee
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form (White) */}
                <div className="flex flex-col justify-center p-12 bg-white md:w-1/2">
                    <div className="mb-8">
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">Welcome back!</h2>
                        <p className="text-sm text-gray-500">Please sign in to continue</p>
                    </div>

                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-500 border border-red-100 rounded bg-red-50">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold tracking-wide text-blue-400 uppercase">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 text-sm text-gray-700 transition-all border border-gray-200 rounded outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold tracking-wide text-blue-400 uppercase">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 text-sm text-gray-700 transition-all border border-gray-200 rounded outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-600 select-none">Remember me</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center w-full h-12 py-3 mt-4 font-medium text-white transition-all duration-200 bg-red-600 rounded shadow-sm hover:bg-red-700 hover:shadow-md"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        <div className="pt-2 text-center">
                            <a href="#" className="text-sm font-semibold text-gray-900 transition-colors hover:text-blue-600">
                                Forgot password?
                            </a>
                        </div>
                    </form>
                </div >
            </div >
        </div >
    );
};

export default Login;
