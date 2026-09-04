/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from 'react-router-dom';
import { getInitials } from '../Avatar';
import Container from './Container';

const NAV_LINKS = [
    { label: 'Home', href: '#top' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
];

export default function Navbar({ user, displayName, avatarUrl, menuOpen, onToggleMenu, onCloseMenu, onLogout }) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F5F0]/90 backdrop-blur-md border-b border-[#141414]/10">
            <Container>
                <div className="h-[72px] lg:h-20 flex items-center justify-between gap-4">
                    {/* LEFT: Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <img src="/favicon.svg" alt="Wealth Flow logo" className="w-8 h-8 rounded-lg" />
                        <span className="font-headline-sm text-headline-sm text-[#141414] tracking-tight font-semibold hidden sm:inline">
                            Wealth Flow
                        </span>
                    </Link>

                    {/* CENTER: Nav */}
                    <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className={`font-body-md text-body-md transition-colors py-1 whitespace-nowrap ${
                                    link.href === '#top'
                                        ? 'text-[#141414] border-b-2 border-[#141414] font-headline-sm'
                                        : 'text-[#141414]/70 hover:text-[#141414]'
                                }`}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="hidden md:inline-flex items-center justify-center border border-[#141414] bg-transparent text-[#141414] rounded-full px-5 py-2 font-headline-sm text-body-md hover:bg-[#141414] hover:text-[#F5F5F0] transition-colors duration-200 whitespace-nowrap">
                                    Dashboard
                                </Link>
                                <Link to="/dashboard" className="w-8 h-8 rounded-full bg-[#141414]/5 flex items-center justify-center overflow-hidden">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] font-bold text-[#141414]">{getInitials(displayName || 'User')}</span>
                                    )}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="inline-flex items-center justify-center border border-[#141414] bg-transparent text-[#141414] rounded-full px-5 py-2 font-headline-sm text-body-md hover:bg-[#141414] hover:text-[#F5F5F0] transition-colors duration-200 whitespace-nowrap">
                                    Get Started
                                </Link>
                            </>
                        )}
                        <button onClick={onToggleMenu} className="md:hidden w-9 h-9 rounded-lg bg-[#141414]/5 flex items-center justify-center" aria-label="Toggle menu">
                            <span className="material-symbols-outlined text-[20px] text-[#141414]">{menuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>
            </Container>

            {menuOpen && (
                <div className="md:hidden border-t border-[#141414]/10 bg-[#F5F5F0]">
                    <Container className="py-5">
                        <nav className="flex flex-col gap-4">
                            {NAV_LINKS.map((link) => (
                                <a key={link.href} href={link.href} onClick={onCloseMenu} className="font-body-md text-body-md text-[#141414]/70 hover:text-[#141414]">{link.label}</a>
                            ))}
                            <div className="mt-2 pt-4 border-t border-[#141414]/10 flex flex-col gap-3">
                                {user ? (
                                    <>
                                        <Link to="/dashboard" onClick={onCloseMenu} className="font-headline-sm text-body-md font-semibold text-[#141414]">Dashboard</Link>
                                        <button onClick={onLogout} className="text-left font-headline-sm text-body-md font-semibold text-[#141414]/70 cursor-pointer">Logout</button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/register" onClick={onCloseMenu} className="inline-flex items-center justify-center border border-[#141414] bg-[#141414] text-[#F5F5F0] rounded-full px-5 py-2.5 font-headline-sm text-body-md text-center w-full max-w-[340px]">Get Started</Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </Container>
                </div>
            )}
        </header>
    );
}
