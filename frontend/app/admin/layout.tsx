'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FormInput, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  FileText,
  BarChart3,
  Home
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip auth check for login page or the admin root
    if (pathname === '/admin/login' || pathname === '/admin') {
      setIsLoading(false);
      return;
    }

    // Check authentication for other pages
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    // If no token or user data, allow the dashboard page to handle unauthenticated
    // access itself so it can show a modal instead of redirecting immediately.
    if (!token || !userData) {
      if (pathname === '/admin/dashboard') {
        setIsLoading(false);
        return;
      }
      router.push('/admin/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    const allowedRoles = ['admin', 'superemployee'];
    if (!allowedRoles.includes(parsedUser.role)) {
      // If visiting dashboard, allow the page to show its own not-authenticated modal
      if (pathname === '/admin/dashboard') {
        setIsLoading(false);
        return;
      }
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      router.push('/admin/login');
      return;
    }
    setUser(parsedUser);
    setIsLoading(false);
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', badge: null },
    { name: 'Form Builder', icon: FormInput, path: '/admin/form-builder', badge: null },
    { name: 'Submissions', icon: FileText, path: '/admin/submissions', badge: '12' },
    { name: 'Groups', icon: Users, path: '/admin/groups', badge: null },
    { name: 'Users', icon: Users, path: '/admin/users', badge: null },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics', badge: null },
    { name: 'Settings', icon: Settings, path: '/admin/settings', badge: null },
  ];

  // Show login page without layout
  if (pathname === '/admin/login' || pathname === '/admin') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-12">
        <div className="flex items-center justify-between h-full px-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                H
              </div>
              <span className="text-sm font-semibold hidden sm:block text-purple-500">Admin Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
              title="Go to Landing Page"
            >
              <Home className="w-4 h-4" />
            </button>
            {user ? (
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-gray-900">{user.name || user.email}</div>
                <div className="text-xs text-gray-500">{user.user_type}</div>
              </div>
            ) : (
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-gray-900">Not signed in</div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-12 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-52' : 'w-0'
        } overflow-hidden`}
      >
        <nav className="p-2 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3 h-3" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-12 transition-all duration-300 ${
          sidebarOpen ? 'ml-52' : 'ml-0'
        }`}
      >
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  );
}
