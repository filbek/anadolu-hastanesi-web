import React from 'react';
import { IconType } from 'react-icons';
import { FaChevronRight } from 'react-icons/fa';

interface AdminCardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    className?: string;
}

export const AdminCard: React.FC<AdminCardProps> = ({
    children,
    title,
    subtitle,
    actions,
    className = ""
}) => (
    <div className={`admin-card overflow-hidden ${className}`}>
        {(title || actions) && (
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                    {title && <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>}
                    {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center space-x-2">{actions}</div>}
            </div>
        )}
        <div className="px-6 py-6 font-sans">
            {children}
        </div>
    </div>
);

interface StatCardProps {
    title: string;
    value: string | number;
    icon: IconType;
    trend?: string;
    trendUp?: boolean;
    color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    color = "bg-primary"
}) => (
    <div className="admin-card group hover:-translate-y-1">
        <div className="p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{title}</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
                    {trend && (
                        <div className="flex items-center mt-3 text-sm">
                            <span className={`font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                                {trendUp ? '↑' : '↓'} {trend}
                            </span>
                            <span className="text-slate-400 ml-1.5 font-medium">bu ay</span>
                        </div>
                    )}
                </div>
                <div className={`w-14 h-14 rounded-2xl ${color}/10 flex items-center justify-center text-2xl text-${color.replace('bg-', '')} group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-${color.replace('bg-', '')}/10`}>
                    <Icon />
                </div>
            </div>
        </div>
    </div>
);

interface ActionButtonProps {
    onClick?: () => void;
    icon: IconType;
    label: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    onClick,
    icon: Icon,
    label,
    variant = 'primary',
    className = ""
}) => {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20',
        secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100',
        ghost: 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    };

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${variants[variant]} ${className}`}
        >
            <Icon className={label ? 'mr-2' : ''} />
            {label}
        </button>
    );
};
