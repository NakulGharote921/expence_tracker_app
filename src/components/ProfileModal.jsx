/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Profile & Account Modal — Wealth Flow
 */
import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, Shield, Calendar, CreditCard, Wallet, LogOut, Save, CheckCircle, ChevronRight, Crown, Globe } from 'lucide-react';
import Avatar from './Avatar';

const CURRENCY_OPTIONS = [
    { code: 'INR', label: 'INR — Indian Rupee', symbol: '₹' },
    { code: 'USD', label: 'USD — US Dollar', symbol: '$' },
    { code: 'EUR', label: 'EUR — Euro', symbol: '€' },
    { code: 'GBP', label: 'GBP — British Pound', symbol: '£' },
    { code: 'JPY', label: 'JPY — Japanese Yen', symbol: '¥' },
];

function SectionLabel({ children }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-outline">
                {children}
            </span>
            <div className="flex-1 h-px bg-outline-variant/50" />
        </div>
    );
}

function FieldLabel({ children }) {
    return (
        <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
            {children}
        </label>
    );
}

function ReadOnlyField({ label, value, icon: Icon }) {
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <div className="w-full bg-surface-container-low border border-outline-variant/50 text-xs rounded-xl py-2.5 px-3 flex items-center gap-2.5 text-on-surface-variant">
                {Icon && <Icon className="w-3.5 h-3.5 text-outline/60 shrink-0" />}
                <span className="font-medium">{value}</span>
            </div>
        </div>
    );
}

function EditableField({ label, value, onChange, placeholder, type = 'text', prefix, readOnly = false }) {
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-outline pointer-events-none">
                        {prefix}
                    </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    className={`w-full bg-surface-container-low border text-xs rounded-xl py-2.5 outline-none font-semibold transition-all
                        ${readOnly
                            ? 'border-outline-variant/50 text-on-surface-variant cursor-default'
                            : 'border-outline focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface hover:border-outline'
                        }
                        ${prefix ? 'pl-6 pr-3' : 'px-3'}
                    `}
                />
            </div>
        </div>
    );
}

function InfoRow({ label, value, valueColor = 'text-on-surface', trailing }) {
    return (
        <div className="flex items-center justify-between py-2.5">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${valueColor}`}>{value}</span>
                {trailing}
            </div>
        </div>
    );
}

export default function ProfileModal({
    isOpen,
    onClose,
    profileName,
    profilePhoto,
    profilePhone,
    profileCurrency,
    isPremium,
    email,
    userKey,
    targetBudget,
    onTargetBudgetChange,
    onSave,
    onLogout,
    triggerToast,
    writeTargetBudget,
    onOpenUpgrade,
}) {
    const [editedName, setEditedName] = useState(profileName || '');
    const [editedPhone, setEditedPhone] = useState(profilePhone || '');
    const [editedCurrency, setEditedCurrency] = useState(profileCurrency || 'INR');
    const [editedBudget, setEditedBudget] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setEditedName(profileName || '');
            setEditedPhone(profilePhone || '');
            setEditedCurrency(profileCurrency || 'INR');
            setEditedBudget(targetBudget ? targetBudget.toString() : '');
            setErrors({});
        }
    }, [isOpen, profileName, profilePhone, profileCurrency, targetBudget]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const validate = () => {
        const newErrors = {};
        if (!editedName.trim()) {
            newErrors.name = 'Profile name is required.';
        }
        if (editedBudget && (isNaN(parseFloat(editedBudget)) || parseFloat(editedBudget) < 0)) {
            newErrors.budget = 'Enter a valid budget amount.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSaving(true);
        try {
            const budgetVal = editedBudget ? parseFloat(editedBudget) : null;

            if (budgetVal !== null && budgetVal !== targetBudget) {
                await writeTargetBudget(budgetVal);
                onTargetBudgetChange(budgetVal);
            }

            onSave(editedName.trim(), editedPhone.trim(), editedCurrency);
            triggerToast('Profile updated successfully.');
            onClose();
        } catch (err) {
            triggerToast('Unable to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    const handleSignOut = () => {
        onLogout();
        onClose();
    };

    const memberSince = (() => {
        try {
            const key = userKey || '';
            const decoded = atob(key);
            return 'Aug 2026';
        } catch {
            return 'Aug 2026';
        }
    })();

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-on-background/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        >
            <div className="bg-surface-container-lowest border border-outline-variant rounded-[24px] max-w-[640px] w-full max-h-[90vh] shadow-2xl relative animate-scale-up flex flex-col">

                {/* Sticky Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/30 shrink-0">
                    <div>
                        <h2 className="text-base font-black text-on-surface tracking-tight">
                            Profile & Account
                        </h2>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">
                            Manage your personal information and account preferences.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-outline hover:text-on-surface hover:bg-surface-container p-1.5 rounded-full transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

                    {/* Profile Header */}
                    <div className="flex items-center gap-4 pb-5 border-b border-outline-variant/30">
                        <Avatar
                            photoURL={profilePhoto}
                            name={editedName || profileName}
                            className="w-16 h-16 text-xl border-2 border-outline-variant/40"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-on-surface tracking-tight truncate">
                                {editedName || profileName}
                            </h3>
                            <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                                {email}
                            </p>
                            <span className={`inline-block mt-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border
                                ${isPremium
                                    ? 'text-primary border-primary/30 bg-primary/5'
                                    : 'text-on-surface-variant border-outline-variant/50 bg-surface-container-low'
                                }`}>
                                {isPremium ? 'Premium Standard' : 'Free Demo Tier'}
                            </span>
                        </div>
                    </div>

                    {/* Section 1 — Personal Information */}
                    <div>
                        <SectionLabel>Personal Information</SectionLabel>
                        <div className="space-y-3">
                            <EditableField
                                label="Profile Name"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                placeholder="Enter your name"
                            />
                            {errors.name && (
                                <p className="text-[10px] text-error font-medium -mt-1">{errors.name}</p>
                            )}
                            <ReadOnlyField
                                label="Email Address"
                                value={email}
                                icon={Mail}
                            />
                            <EditableField
                                label="Phone Number"
                                value={editedPhone}
                                onChange={(e) => setEditedPhone(e.target.value)}
                                placeholder="Add phone number"
                            />
                        </div>
                    </div>

                    {/* Section 2 — Account Details */}
                    <div>
                        <SectionLabel>Account Details</SectionLabel>
                        <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 divide-y divide-outline-variant/30">
                            <div className="px-3">
                                <InfoRow
                                    label="Authentication"
                                    value="Google Account"
                                    valueColor="text-on-surface"
                                />
                            </div>
                            <div className="px-3">
                                <InfoRow
                                    label="Account Status"
                                    value="Active"
                                    valueColor="text-[#2ECC71]"
                                />
                            </div>
                            <div className="px-3">
                                <InfoRow
                                    label="Member Since"
                                    value={memberSince}
                                    valueColor="text-on-surface"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3 — Subscription */}
                    <div>
                        <SectionLabel>Subscription</SectionLabel>
                        <div className="flex items-center justify-between bg-surface-container-low rounded-xl border border-outline-variant/40 p-3.5">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                    ${isPremium ? 'bg-primary/10' : 'bg-surface-container'}`}>
                                    <Crown className={`w-4 h-4 ${isPremium ? 'text-primary' : 'text-outline'}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface">
                                        {isPremium ? 'Premium Standard' : 'Free Demo Tier'}
                                    </p>
                                    <p className="text-[10px] text-on-surface-variant font-medium">
                                        {isPremium ? 'All features unlocked' : 'Limited features'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { onClose(); onOpenUpgrade(); }}
                                className="text-[10px] font-bold text-primary hover:text-on-primary hover:bg-primary px-3 py-1.5 rounded-lg border border-primary/30 hover:border-primary transition-all flex items-center gap-1"
                            >
                                Adjust Plan
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Section 4 — Financial Preferences */}
                    <div>
                        <SectionLabel>Financial Preferences</SectionLabel>
                        <div className="space-y-3">
                            <div>
                                <FieldLabel>Default Currency</FieldLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-outline pointer-events-none">
                                        {CURRENCY_OPTIONS.find(c => c.code === editedCurrency)?.symbol || '₹'}
                                    </span>
                                    <select
                                        value={editedCurrency}
                                        onChange={(e) => setEditedCurrency(e.target.value)}
                                        className="w-full bg-surface-container-low border border-outline focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs rounded-xl py-2.5 pl-6 pr-3 outline-none font-semibold text-on-surface hover:border-outline transition-all appearance-none cursor-pointer"
                                    >
                                        {CURRENCY_OPTIONS.map(c => (
                                            <option key={c.code} value={c.code}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <EditableField
                                label="Monthly Target Budget"
                                value={editedBudget}
                                onChange={(e) => setEditedBudget(e.target.value)}
                                placeholder="0"
                                type="number"
                                prefix={CURRENCY_OPTIONS.find(c => c.code === editedCurrency)?.symbol || '₹'}
                            />
                            {errors.budget && (
                                <p className="text-[10px] text-error font-medium -mt-1">{errors.budget}</p>
                            )}
                        </div>
                    </div>
                </form>

                {/* Sticky Footer */}
                <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-error/80 hover:text-error hover:bg-error/5 px-3 py-2 rounded-xl border border-transparent hover:border-error/20 transition-all uppercase tracking-wider"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-2 px-4 rounded-xl hover:bg-surface-container text-xs font-bold text-on-surface-variant transition-all border border-outline-variant/40"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary text-on-primary font-bold py-2 px-5 rounded-xl hover:bg-primary-container shadow transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
