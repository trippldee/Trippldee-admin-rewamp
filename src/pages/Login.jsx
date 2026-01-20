
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                localStorage.setItem('admin_token', response.data.data.access_token);
                localStorage.setItem('admin_user', JSON.stringify(response.data.data.user));
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                {/* Left Side - Brand Info (Dark Navy) */}
                <div className="md:w-1/2 bg-[#0B0F1C] p-12 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            {/* Logo Snail Icon Placeholder */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-xs font-bold transform -rotate-12">
                                🐌
                            </div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
                                trippldee
                            </h1>
                        </div>

                        <h2 className="text-xl font-semibold mb-6">Trippldee</h2>

                        <p className="text-gray-300 leading-relaxed text-sm max-w-xs">
                            We aim to provide a mobilized platform for you to find 'the one' for you.
                        </p>
                    </div>

                    <div className="mt-12">
                        <p className="text-xs text-gray-500 mb-1">
                            Powered by : 2023 DDDKING NET LINE PVT. LTD
                        </p>
                        <p className="text-xs text-gray-500">
                            © 2026 Trippldee
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form (White) */}
                <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
                        <p className="text-gray-500 text-sm">Please sign in to continue</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded bg-red-50 text-red-500 text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-gray-700"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-gray-700"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center h-12 mt-4"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <a href="#" className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                Forgot password?
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
