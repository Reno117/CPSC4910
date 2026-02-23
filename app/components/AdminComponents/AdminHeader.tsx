'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function AdminHeader() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const session = authClient.useSession();
    const user = session.data?.user as { name?: string | null; role?: string | null } | undefined;
    const displayName = user?.name ?? 'User';
    const displayRole = user?.role
        ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`
        : 'Admin';

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleLogout = async () => {
        await authClient.signOut();
        window.location.href = '/login';
    };

    return (
        <>
            <header className={`fixed top-0 w-full bg-blue-400 text-white transition-transform duration-300 z-50 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex justify-between items-center p-4 h-16">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-white text-2xl focus:outline-none"
                    >
                        ☰
                    </button>
                    <Link
                        href="/admin"
                        className="text-xl font-bold hover:text-blue-100"
                    >
                        Admin Dashboard
                    </Link>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => {}}
                            className="text-white text-2xl focus:outline-none hover:text-blue-200"
                            title="Settings"
                        >
                            ⚙️
                        </button>
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="text-white text-2xl focus:outline-none hover:text-blue-200"
                            title="Profile"
                        >
                            👤
                        </button>
                    </div>
                </div>
            </header>

            <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="bg-black bg-opacity-50 absolute inset-0" onClick={() => setMenuOpen(false)}></div>
                <div className={`absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4">
                        <h2 className="text-lg font-bold mb-4 text-gray-800">Menu</h2>
                        <ul className="space-y-2">
                            <li><Link href="/admin" className="block p-2 hover:bg-gray-200 text-black-700 hover:text-blue-400 text-xl" onClick={() => setMenuOpen(false)}>Manage Users</Link></li>
                            <li><Link href="/admin" className="block p-2 hover:bg-gray-200 text-black-700 hover:text-blue-400 text-xl" onClick={() => setMenuOpen(false)}>Create Users</Link></li>
                            <li><Link href="/admin" className="block p-2 hover:bg-gray-200 text-black-700 hover:text-blue-400 text-xl" onClick={() => setMenuOpen(false)}>Create Sponsor Organization</Link></li>
                            <li><Link href="/admin" className="block p-2 hover:bg-gray-200 text-black-700 hover:text-blue-400 text-xl" onClick={() => setMenuOpen(false)}>Orders</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {profileOpen && (
                <div className="fixed top-16 right-4 bg-white shadow-lg rounded-md z-50 w-48">
                    <div className="p-4">
                        <p className="text-sm text-gray-600">Logged in as: <strong>{displayName}</strong></p>
                        <p className="text-sm text-gray-600">Role: <strong>{displayRole}</strong></p>
                        <button
                            onClick={handleLogout}
                            className="mt-2 w-full bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}