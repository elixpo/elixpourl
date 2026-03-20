'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@/lib/types';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/dashboard/urls', label: 'My URLs', icon: '◇' },
  { href: '/dashboard/new', label: 'Shorten URL', icon: '+' },
];

const accountItems = [
  { href: '/profile', label: 'Profile', icon: '○' },
  { href: '/profile/keys', label: 'API Keys', icon: '⚿' },
];

const adminItems = [
  { href: '/admin', label: 'Monitoring', icon: '◉' },
  { href: '/admin/users', label: 'Users', icon: '◎' },
  { href: '/admin/audit', label: 'Audit Log', icon: '☰' },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-60 fixed top-0 left-0 bottom-0 flex flex-col border-r border-border-light"
      style={{ background: 'rgba(16, 24, 12, 0.6)', backdropFilter: 'blur(20px)' }}>
      {/* Brand */}
      <div className="px-5 pt-6 pb-8">
        <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
          <Image src="/logo.png" alt="ElixpoURL" width={28} height={28} className="rounded-lg" />
          <span className="text-lg font-display font-bold text-text-primary">
            <span className="text-lime-main">Elixpo</span>URL
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-200 no-underline ${
              isActive(item.href)
                ? 'text-lime-main border-r-2 border-lime-main'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-glass'
            }`}
            style={isActive(item.href) ? { background: 'rgba(163, 230, 53, 0.06)' } : {}}
          >
            <span className="w-5 text-center opacity-60">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="px-5 pt-6 pb-2 text-[0.65rem] text-text-disabled uppercase tracking-wider">
          Account
        </div>
        {accountItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-200 no-underline ${
              isActive(item.href)
                ? 'text-lime-main border-r-2 border-lime-main'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-glass'
            }`}
            style={isActive(item.href) ? { background: 'rgba(163, 230, 53, 0.06)' } : {}}
          >
            <span className="w-5 text-center opacity-60">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {user.role === 'admin' && (
          <>
            <div className="px-5 pt-6 pb-2 text-[0.65rem] text-text-disabled uppercase tracking-wider">
              Admin
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-200 no-underline ${
                  isActive(item.href)
                    ? 'text-lime-main border-r-2 border-lime-main'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-glass'
                }`}
                style={isActive(item.href) ? { background: 'rgba(163, 230, 53, 0.06)' } : {}}
              >
                <span className="w-5 text-center opacity-60">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-5 py-4 border-t border-border-light">
        <Link href="/profile" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-full bg-lime-dim border border-lime-border flex items-center justify-center text-sm font-semibold text-lime-main overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user.display_name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              {user.display_name}
            </div>
            <div className="text-[0.65rem] text-text-disabled capitalize">
              {user.tier} plan
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
