import React from 'react';
import { Clock, CheckCircle, CreditCard, TrendingUp, Receipt } from 'lucide-react';

const MetricItem = ({ label, value, icon: Icon, iconBg, iconColor, progressBarColor, showProgress }) => (
    <div className="">
        <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0 mt-1`}>
                <Icon className={iconColor} size={20} strokeWidth={2} />
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</p>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{value}</h4>
                {showProgress && (
                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${progressBarColor} rounded-full`}
                            style={{ width: progressBarColor.includes('orange') ? '40%' : '75%' }} // Mock width
                        ></div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const PerformanceCard = ({ title, type }) => {
    // Data configured based on type for demo purposes, matching the image content
    const isRestaurant = type === 'restaurant';

    // Default to Kitchen Data (as per images)
    let metrics = [
        { label: 'Pending Cloud Kitchens', value: '12', icon: Clock, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', progressBarColor: 'bg-orange-500', showProgress: true },
        { label: 'Active Cloud Kitchens', value: '330', icon: CheckCircle, iconBg: 'bg-orange-100', iconColor: 'text-white bg-orange-500 rounded-full p-1', iconColorRaw: true, progressBarColor: 'bg-green-500', showProgress: true },
        { label: 'Cloud Kitchen Subscribers', value: '30', icon: CreditCard, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', progressBarColor: 'bg-orange-500', showProgress: true },
        { label: 'Total Cloud Kitchen Revenue Generated', value: '$156,200', icon: TrendingUp, iconBg: 'bg-orange-500', iconColor: 'text-white', showProgress: false },
        { label: 'Subscription Revenue Generated', value: '$15,200', icon: CreditCard, iconBg: 'bg-orange-500', iconColor: 'text-white', showProgress: false },
        { label: 'Tax Collected', value: '$15,620', icon: Receipt, iconBg: 'bg-orange-500', iconColor: 'text-white', showProgress: false },
    ];

    if (isRestaurant) {
        metrics = [
            { label: 'Pending Restaurants', value: '47', icon: Clock, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', progressBarColor: 'bg-orange-500', showProgress: true },
            { label: 'Active Restaurants', value: '1,200', icon: CheckCircle, iconBg: 'bg-orange-100', iconColor: 'text-white bg-orange-500 rounded-full p-1', iconColorRaw: true, progressBarColor: 'bg-green-500', showProgress: true },
            { label: 'Restaurants Subscribers', value: '43', icon: CreditCard, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', progressBarColor: 'bg-orange-500', showProgress: true },
            { label: 'Total Restaurant Revenue Generated', value: '$284,500', icon: TrendingUp, iconBg: 'bg-orange-500', iconColor: 'text-white', showProgress: false },
            { label: 'Subscription Revenue Generated', value: '$284,500', icon: CreditCard, iconBg: 'bg-orange-500', iconColor: 'text-white', showProgress: false },
            { label: 'Tax Collected', value: '$28,450', icon: Receipt, iconBg: 'bg-orange-500', iconColor: 'text-white', showProgress: false },
        ];
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">{title}</h3>
            <div className="space-y-4">
                {metrics.map((m, i) => (
                    <MetricItem
                        key={i}
                        {...m}
                        // Handle special case for the 'Active' icon which is filled in the image
                        icon={m.icon}
                        iconColor={m.iconColorRaw ? 'text-white' : m.iconColor}
                        iconBg={m.iconColorRaw ? 'bg-orange-100' : m.iconBg}
                    // Note: The image shows the CHECK circle as white inside an orange circle or orange inside white? 
                    // Actually in image 3: Check is white inside orange filled circle.
                    // I adjusted props above to handle this 'iconColorRaw' custom logic slightly.
                    />
                ))}
            </div>
        </div>
    );
};

export default PerformanceCard;
