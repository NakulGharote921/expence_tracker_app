/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabaseDb } from '../utils/supabaseDb';

import Navbar from '../components/home/Navbar';
import HeroSection from '../components/home/HeroSection';
import QuickActionsSection from '../components/home/QuickActionsSection';
import FeaturesBentoSection from '../components/home/FeaturesBentoSection';
import AIExpenseEntrySection from '../components/home/AIExpenseEntrySection';
import DashboardCockpitSection from '../components/home/DashboardCockpitSection';
import CTASection from '../components/home/CTASection';
import Footer from '../components/home/Footer';

export default function Home() {
    const navigate = useNavigate();
    const { user, displayName, avatarUrl } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        setMenuOpen(false);
        supabaseDb.signOut().catch(() => {});
        navigate('/login', { replace: true });
    };

    return (
        <div id="top" className="bg-[#F5F5F0] text-[#141414] font-sans min-h-screen overflow-x-hidden">
            <Navbar
                user={user}
                displayName={displayName}
                avatarUrl={avatarUrl}
                menuOpen={menuOpen}
                onToggleMenu={() => setMenuOpen((v) => !v)}
                onCloseMenu={() => setMenuOpen(false)}
                onLogout={handleLogout}
            />

            <main className="w-full pt-[72px] lg:pt-20 bg-[#F5F5F0]">
                <div className="flex flex-col w-full">
                    <HeroSection />
                    <QuickActionsSection />
                    <FeaturesBentoSection />
                    <AIExpenseEntrySection />
                    <DashboardCockpitSection />
                    <CTASection />
                </div>
            </main>

            <Footer />
        </div>
    );
}
