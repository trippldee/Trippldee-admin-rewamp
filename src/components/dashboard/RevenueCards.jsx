import React from 'react';
import { Wallet, CreditCard, MessageCircle } from 'lucide-react';

const RevenueCard = ({ title, value, icon: Icon, iconBg, iconColor }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 mb-4 card-zoom">
        <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={iconColor} size={24} />
        </div>
        <div>
            <h3 className="text-gray-400 dark:text-gray-500 text-[10px] tablet:text-xs font-bold uppercase tracking-wider mb-1 leading-relaxed">{title}</h3>
            <p className="text-xl tablet:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const RevenueCards = () => {
    return (
        <div className="flex flex-col w-full">
            <RevenueCard
                title="TOTAL REVENUE FROM RESTAURANT & CLOUD KITCHEN"
                value="₹2,45,143.52"
                icon={Wallet}
                iconBg="bg-blue-50 dark:bg-blue-900/20"
                iconColor="text-blue-500 dark:text-blue-400"
            />
            <RevenueCard
                title="TOTAL REVENUE FROM SUBSCRIPTION"
                value="₹20,20,286"
                icon={CreditCard}
                iconBg="bg-orange-50 dark:bg-orange-900/20"
                iconColor="text-orange-500 dark:text-orange-400"
            />
            <RevenueCard
                title="TOTAL REVENUE FROM WHATSAPP"
                value="₹0"
                icon={MessageCircle}
                iconBg="bg-green-50 dark:bg-green-900/20"
                iconColor="text-green-500 dark:text-green-400"
            />
        </div>
    );
};

export default RevenueCards;
