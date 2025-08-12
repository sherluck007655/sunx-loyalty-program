import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  CreditCardIcon,
  GiftIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CloudArrowDownIcon,
  KeyIcon,
  CogIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  PlayIcon,
  FolderArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatLoyaltyCardId } from '../utils/formatters';
import NotificationBell from './NotificationBell';
import AdminNotificationBell from './AdminNotificationBell';
import FloatingChatButton from './Chat/FloatingChatButton';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { cn } from '../lib/utils';
import clsx from 'clsx';

const Layout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, userType } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation items for installer
  const installerNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Serial Numbers', href: '/serials', icon: DocumentTextIcon },
    { name: 'Payments', href: '/payments', icon: CreditCardIcon },
    { name: 'Promotions', href: '/promotions', icon: GiftIcon },
    { name: 'Training', href: '/training', icon: PlayIcon },
    { name: 'Downloads', href: '/downloads', icon: FolderArrowDownIcon },
  ];

  // Navigation items for admin
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Reports', href: '/admin/reports', icon: DocumentArrowDownIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Messages', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Installers', href: '/admin/installers', icon: UserIcon },
    { name: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
    { name: 'Serial Numbers', href: '/admin/serials', icon: DocumentTextIcon },
    { name: 'Valid Serials', href: '/admin/valid-serials', icon: DocumentTextIcon },
    { name: 'Promotions', href: '/admin/promotions', icon: GiftIcon },
    { name: 'Training', href: '/training', icon: PlayIcon },
    { name: 'Downloads', href: '/downloads', icon: FolderArrowDownIcon },
    { name: 'Activities', href: '/admin/activities', icon: ClockIcon },
    { name: 'Backup', href: '/admin/backup', icon: CloudArrowDownIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ];

  const navigation = userType === 'admin' ? adminNavigation : installerNavigation;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 touch-manipulation" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 sm:w-80 flex-col bg-background border-r shadow-xl">
          <div className="flex h-14 sm:h-16 items-center justify-between px-4 bg-primary">
            <Link to={userType === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20">
                <span className="text-lg font-bold text-primary-foreground">S</span>
              </div>
              <span className="ml-2 text-lg font-bold text-primary-foreground">SunX</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 sm:h-10 sm:w-10 touch-manipulation"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors touch-manipulation',
                    isActive
                      ? 'bg-primary/10 text-primary border-r-2 border-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-4 h-6 w-6 flex-shrink-0" />
                  <span className="text-base">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-base font-medium text-primary-foreground">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-base font-medium text-foreground truncate">
                  {user?.name}
                </p>
                {user?.loyaltyCardId && (
                  <p className="text-sm text-muted-foreground truncate">
                    {formatLoyaltyCardId(user.loyaltyCardId)}
                  </p>
                )}
                {userType === 'admin' && (
                  <p className="text-sm text-muted-foreground">
                    Administrator
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-background border-r shadow-lg">
          <div className="flex h-16 items-center px-4 bg-primary">
            <Link to={userType === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20">
                <span className="text-lg font-bold text-primary-foreground">S</span>
              </div>
              <span className="ml-2 text-lg font-bold text-primary-foreground">SunX</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary border-r-2 border-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                {user?.loyaltyCardId && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatLoyaltyCardId(user.loyaltyCardId)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-14 sm:h-16 shrink-0 items-center gap-x-2 sm:gap-x-4 border-b bg-background px-3 sm:px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          <div className="flex flex-1 gap-x-2 sm:gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              {title && (
                <h1 className="text-sm sm:text-lg font-semibold text-foreground truncate">
                  {title}
                </h1>
              )}
            </div>
            <div className="flex items-center gap-x-1 sm:gap-x-2 lg:gap-x-4">
              {/* Notifications */}
              <div className="hidden xs:block">
                {userType === 'installer' && <NotificationBell />}
                {userType === 'admin' && <AdminNotificationBell />}
              </div>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={toggleTheme}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <SunIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>

              {/* Logout button */}
              <button
                className="inline-flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground touch-manipulation"
                onClick={handleLogout}
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-3 sm:py-6 bg-background">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  );
};

export default Layout;
