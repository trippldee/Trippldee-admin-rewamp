import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';

const BMI = () => {
    const [file, setFile] = useState(null);
    const [type, setType] = useState('casual');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                toast.error('Only CSV files are allowed');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.post('https://test.trippldee.com/next/api/bmi/upload-csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success || response.status === 200 || response.status === 201) {
                toast.success(response.data.message || 'CSV uploaded successfully!');
                setFile(null);
                setType('casual');
            } else {
                toast.error(response.data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading CSV:', error);
            toast.error(error.response?.data?.message || 'Error uploading CSV');
        } finally {
            setLoading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">BMI Data Upload</h2>
                <p className="text-gray-500 dark:text-gray-400">Upload CSV files for BMI calculations based on casual or diet types.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setType('casual')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${type === 'casual'
                            ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'border-gray-200 hover:border-orange-200 bg-white dark:bg-slate-800 dark:border-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${type === 'casual' ? 'border-orange-500' : 'border-gray-300'}`}>
                            {type === 'casual' && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                        </div>
                        <span className="font-semibold">Casual</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setType('diet')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${type === 'diet'
                            ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'border-gray-200 hover:border-orange-200 bg-white dark:bg-slate-800 dark:border-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${type === 'diet' ? 'border-orange-500' : 'border-gray-300'}`}>
                            {type === 'diet' && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                        </div>
                        <span className="font-semibold">Diet</span>
                    </button>
                </div>

                {/* File Upload Area */}
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${dragActive
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                        : 'border-gray-300 hover:border-orange-400 dark:border-gray-700'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {!file ? (
                        <div className="flex flex-col items-center pointer-events-none">
                            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4 dark:bg-slate-800">
                                <Upload size={32} />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                CSV files only
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 dark:bg-slate-800 dark:border-gray-700 z-10 relative">
                            <div className="flex items-center gap-3">
                                <FileSpreadsheet className="text-green-500" size={24} />
                                <div className="text-left">
                                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={removeFile}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !file}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Uploading...
                        </div>
                    ) : (
                        'Upload CSV'
                    )}
                </button>
            </form>
        </div>
    );
};

export default BMI;
