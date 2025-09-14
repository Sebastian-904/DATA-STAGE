
import React from 'react';
import { KpiCardProps } from '../types';

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color }) => {
    return (
        <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${color} transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-gray-500 font-medium mb-1 dark:text-gray-400">{title}</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{Number(value).toLocaleString()}</p>
                </div>
                <div className={`text-3xl ${color.replace('border-', 'text-')}`}>
                    <i className={icon}></i>
                </div>
            </div>
        </div>
    );
};