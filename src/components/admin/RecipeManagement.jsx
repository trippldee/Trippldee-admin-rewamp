import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    FileText,
    AlertOctagon,
    Ban,
    Eye,
    ChevronLeft,
    ChevronRight,
    Search,
    MessageSquare,
    Share2,
    ThumbsUp,
    ShieldAlert,
    ChefHat,
    Clock,
    Users,
    UtensilsCrossed,
    Flame
} from 'lucide-react';

const RecipeManagement = () => {
    const [activeTab, setActiveTab] = useState('reported'); // 'reported' | 'blocked'
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Helpers to extract alias
    const getAliasFromUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('alias');
        } catch (e) {
            return null;
        }
    };

    const fetchRecipes = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const endpoint = activeTab === 'reported'
                ? `https://test.trippldee.com/next/api/admin/list-reported-recipes`
                : `https://test.trippldee.com/next/api/admin/get-blocked-recipes`;

            const response = await axios.get(endpoint, {
                params: { page },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status || response.data.success) {
                setRecipes(response.data.data);
                if (response.data.meta) {
                    setPagination({
                        current_page: response.data.meta.current_page,
                        last_page: response.data.meta.last_page,
                        total: response.data.meta.total,
                        per_page: response.data.meta.per_page
                    });
                }
            } else {
                toast.error(response.data.message || 'Failed to fetch recipes');
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            toast.error('Error loading recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes(1);
    }, [activeTab]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchRecipes(newPage);
        }
    };

    const handleViewDetails = (recipe) => {
        setSelectedRecipe(recipe);
        setIsDetailsModalOpen(true);
    };

    const handleBlockToggle = async (recipe, isBlocking) => {
        // Extract alias
        let alias = recipe.alias || recipe.recipe_alias;
        if (!alias && recipe.recipe_view_url) {
            alias = getAliasFromUrl(recipe.recipe_view_url);
        }

        if (!alias) {
            // Fallback: lowercase and hyphenate name if valid URL extraction fails (risky but maybe necessary?)
            // Actually, let's rely on URL first. If that fails, maybe we can't proceed.
            // But verify the data.
            if (recipe.name) {
                // simplistic fallback, might not be accurate if backend sluggifies differently
                // alias = recipe.name.toLowerCase().replace(/ /g, '-');
            }
            toast.error('Could not find recipe alias');
            return;
        }

        const confirmMsg = isBlocking
            ? "Are you sure you want to block this recipe?"
            : "Are you sure you want to unblock this recipe?";

        if (!window.confirm(confirmMsg)) return;

        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.post('https://test.trippldee.com/next/api/admin/toggle-block-recipe',
                { recipe_alias: alias },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success || response.data.status) {
                toast.success(response.data.message || 'Recipe status updated');
                fetchRecipes(pagination.current_page);
                setIsDetailsModalOpen(false);
            } else {
                toast.error(response.data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error toggling block status:', error);
            toast.error('Error updating recipe status');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-colors duration-300">
            {/* Tabs Header */}
            <div className="border-b px-6 pt-6 flex gap-8 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('reported')}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'reported'
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    Reported Recipes
                    {activeTab === 'reported' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('blocked')}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'blocked'
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    Blocked Recipes
                    {activeTab === 'blocked' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                    )}
                </button>
            </div>

            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {activeTab === 'reported' ? <AlertOctagon className="text-red-600" size={20} /> : <Ban className="text-red-600" size={20} />}
                        {activeTab === 'reported' ? 'Reported Content' : 'Blocked Content'}
                    </h2>
                </div>

                <div className="flex flex-col gap-4">
                    {loading && recipes.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            Loading recipes...
                        </div>
                    ) : recipes.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            No recipes found.
                        </div>
                    ) : (
                        recipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                onClick={() => handleViewDetails(recipe)}
                                className="group relative bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-all cursor-pointer dark:bg-slate-800 dark:border-gray-700"
                            >
                                {/* Image Preview (Thumbnail) */}
                                <div className="hidden sm:block w-32 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden dark:bg-slate-700">
                                    {recipe.images && recipe.images.length > 0 ? (
                                        <img
                                            src={recipe.images[0].url}
                                            alt={recipe.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ChefHat size={24} opacity={0.5} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    {/* Top Row: User & Meta */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 dark:from-green-900 dark:to-emerald-900 dark:text-emerald-200">
                                                {recipe.user_referral_code?.slice(0, 2)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-200 line-clamp-1">{recipe.name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">By: {recipe.user_referral_code}</p>
                                            </div>
                                        </div>
                                        {activeTab === 'reported' && (
                                            <span className="flex-shrink-0 px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-md border border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 flex items-center gap-1">
                                                <ShieldAlert size={12} />
                                                <span className="hidden sm:inline">Reports:</span> {recipe.reports_count}
                                            </span>
                                        )}
                                    </div>

                                    {/* Middle: Details Snippet */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300 mb-2">
                                        {recipe.category && <span className="flex items-center gap-1"><UtensilsCrossed size={12} /> {recipe.category.name}</span>}
                                        {recipe.cuisine_type && <span className="flex items-center gap-1"><Flame size={12} /> {recipe.cuisine_type.name}</span>}
                                        {recipe.preparation_time && <span className="flex items-center gap-1"><Clock size={12} /> {recipe.preparation_time} min</span>}
                                    </div>

                                    {/* Bottom: Stats & Tags */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
                                        <div className="flex gap-4">
                                            <span className="flex items-center gap-1"><ThumbsUp size={14} /> {recipe.likes_count}</span>
                                            <span className="flex items-center gap-1"><Eye size={14} /> {recipe.view_count}</span>
                                            <span className="flex items-center gap-1"><Share2 size={14} /> {recipe.share_count}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded-full border text-[10px] ${recipe.privacy?.alias === 'public'
                                                ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                                : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-800 dark:border-gray-600'
                                                }`}>
                                                {recipe.privacy?.name || 'Public'}
                                            </span>

                                            {/* Action Buttons (Stop Propagation) */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBlockToggle(recipe, activeTab === 'reported');
                                                }}
                                                className={`p-2 rounded-lg transition-colors border ${activeTab === 'reported'
                                                    ? 'text-red-600 border-red-100 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20'
                                                    : 'text-green-600 border-green-100 hover:bg-green-50 dark:border-green-900/30 dark:hover:bg-green-900/20'}`}
                                                title={activeTab === 'reported' ? "Block Recipe" : "Unblock Recipe"}
                                            >
                                                {activeTab === 'reported' ? <Ban size={18} /> : <ThumbsUp size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {recipes.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t dark:border-gray-800">
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
                )}
            </div>

            {/* Details Modal */}
            {isDetailsModalOpen && selectedRecipe && (
                <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] dark:bg-slate-900 dark:border dark:border-gray-800">
                        <div className="p-6 border-b flex justify-between items-center dark:border-gray-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recipe Details</h3>
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <ShieldAlert size={24} className="rotate-45" />
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {/* Header Info */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedRecipe.name}</h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-800 dark:bg-green-900 dark:text-green-200">
                                                {selectedRecipe.user_referral_code?.slice(0, 2)}
                                            </div>
                                            <span>{selectedRecipe.user_referral_code}</span>
                                        </div>
                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                        <span>{selectedRecipe.created_at}</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedRecipe.food_type?.name === 'Non Vegetarian'
                                    ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20'
                                    : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20'
                                    }`}>
                                    {selectedRecipe.food_type?.name || 'Veg'}
                                </span>
                            </div>

                            {/* Images Gallery */}
                            {selectedRecipe.images && selectedRecipe.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                                    {selectedRecipe.images.map((img, idx) => (
                                        <div key={img.id || idx} className="rounded-xl overflow-hidden shadow-sm h-48 border dark:border-gray-700">
                                            <img
                                                src={img.url}
                                                alt={`Recipe image ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 dark:bg-slate-800 dark:border-gray-700 text-center">
                                    <Clock className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Prep & Cook</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{parseInt(selectedRecipe.preparation_time) + parseInt(selectedRecipe.cook_time)} min</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 dark:bg-slate-800 dark:border-gray-700 text-center">
                                    <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Servings</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedRecipe.no_of_servings}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 dark:bg-slate-800 dark:border-gray-700 text-center">
                                    <UtensilsCrossed className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                                    <p className="font-semibold text-gray-900 dark:text-white text-xs line-clamp-1">{selectedRecipe.category?.name}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 dark:bg-slate-800 dark:border-gray-700 text-center">
                                    <Flame className="w-5 h-5 mx-auto mb-1 text-red-500" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Cuisine</p>
                                    <p className="font-semibold text-gray-900 dark:text-white text-xs line-clamp-1">{selectedRecipe.cuisine_type?.name}</p>
                                </div>
                            </div>

                            {/* Two Column Layout for Ingredients & Steps */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Ingredients */}
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs dark:bg-green-900 dark:text-green-300">1</span>
                                        Ingredients
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 ? (
                                            selectedRecipe.ingredients.map((ing, idx) => (
                                                <div key={ing.id || idx} className="flex justify-between items-start p-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-slate-800/50">
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{ing.name}</p>
                                                        {ing.heading && <p className="text-xs text-gray-500">{ing.heading}</p>}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap ml-2">{ing.quantity}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No ingredients listed.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Directions */}
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs dark:bg-orange-900 dark:text-orange-300">2</span>
                                        Steps
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedRecipe.steps && selectedRecipe.steps.length > 0 ? (
                                            selectedRecipe.steps.map((step, idx) => (
                                                <div key={step.id || idx} className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 pb-2 last:pb-0">
                                                    <div className="absolute top-0 -left-[5px] w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-white dark:border-slate-900" />
                                                    {step.heading && <h5 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">{step.heading}</h5>}
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.step}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No steps listed.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Reports Section */}
                            {activeTab === 'reported' && selectedRecipe.reported_users && (
                                <div className="bg-red-50 rounded-xl p-4 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
                                    <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2 dark:text-red-400">
                                        <ShieldAlert size={18} />
                                        Report History ({selectedRecipe.reports_count})
                                    </h4>
                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                        {selectedRecipe.reported_users.map((report, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-lg border border-red-100 text-sm shadow-sm dark:bg-slate-800 dark:border-red-900/30">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{report.referral_code}</span>
                                                    <span className="text-xs text-gray-400">{report.reported_at}</span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 italic">"{report.reason}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 dark:bg-slate-800/50 dark:border-gray-800">
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleBlockToggle(selectedRecipe, activeTab === 'reported')}
                                className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-lg transition-colors flex items-center gap-2 ${activeTab === 'reported'
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                                    }`}
                            >
                                {activeTab === 'reported' ? <Ban size={18} /> : <ThumbsUp size={18} />}
                                {activeTab === 'reported' ? 'Block Recipe' : 'Unblock Recipe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeManagement;
