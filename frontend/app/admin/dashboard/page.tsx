'use client';

import { useEffect, useState } from 'react';
import { FileText, Users, TrendingUp, Clock, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient, { FormSchema } from '@/lib/api-client';
import NotAuthenticatedModal from '@/components/NotAuthenticatedModal';
import FormViewModal from '@/components/FormViewModal';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalForms: 0,
    totalSubmissions: 0,
    activeUsers: 0,
    pendingReviews: 0,
  });
  const [recentForms, setRecentForms] = useState<any[]>([]);
  const [previewForm, setPreviewForm] = useState<FormSchema | null>(null);
  const [notAuth, setNotAuth] = useState(false);

    const fetchDashboardData = async () => {
    try {
      // Fetch forms using API client
      const formsData: FormSchema[] = await apiClient.forms.listForms();
      
      setRecentForms(formsData.slice(0, 5)); // Get latest 5 forms
      
      // Calculate stats
      const totalSubmissions = formsData.reduce((sum: number, form: FormSchema) => 
        sum + (form.submission_count || 0), 0
      );
      
      setStats({
        totalForms: formsData.length,
        totalSubmissions: totalSubmissions,
        activeUsers: 12, // Mock data
        pendingReviews: 2, // Mock data
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      
      // If unauthorized, show not-authenticated modal
      if (error?.status === 401) {
        setNotAuth(true);
        return;
      }
    }
  };

  useEffect(() => {
    // If user is not authenticated, show a modal instead of fetching data
    const isAuth = apiClient.auth.isAuthenticated();
    const storedAdminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const currentUser = apiClient.auth.getUser();
    // If TokenManager has no user but admin_user exists in localStorage, use that
    const storedAdminUser = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;
    const storedUser = !currentUser && storedAdminUser ? JSON.parse(storedAdminUser) : currentUser;
    const allowedRoles = ['admin', 'superemployee'];

    if (!isAuth && !storedAdminToken) {
      setNotAuth(true);
      return;
    }

    if (storedUser && !allowedRoles.includes(storedUser.role)) {
      setNotAuth(true);
      return;
    }

    fetchDashboardData();
  }, []);



  const handleDeleteForm = async (formSlug: string) => {
    if (!confirm('Are you sure you want to permanently delete this form? This action cannot be undone.')) return;

    try {
      await apiClient.forms.deleteForm(formSlug);
      alert('Form deleted successfully');
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      console.error('Error deleting form:', error);
      const msg = error?.data?.error || error?.data?.detail || error?.message || String(error);
      alert(`Failed to delete form: ${msg}`);
    }
  };

  const statCards = [
    { label: 'Total Forms', value: stats.totalForms, icon: FileText, color: 'blue' },
    { label: 'Submissions', value: stats.totalSubmissions, icon: TrendingUp, color: 'green' },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'purple' },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-600 mt-0.5">Overview of your admin portal</p>
          </div>
          <button
            onClick={() => router.push('/admin/form-builder')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            New Form
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const bgColors = {
              blue: 'bg-blue-50',
              green: 'bg-green-50',
              purple: 'bg-purple-50',
              orange: 'bg-orange-50',
            };
            const textColors = {
              blue: 'text-blue-600',
              green: 'text-green-600',
              purple: 'text-purple-600',
              orange: 'text-orange-600',
            };
            const borderColors = {
              blue: 'border-l-blue-500',
              green: 'border-l-green-500',
              purple: 'border-l-purple-500',
              orange: 'border-l-orange-500',
            };
            const shadowColors = {
              blue: 'hover:shadow-blue-500/20',
              green: 'hover:shadow-green-500/20',
              purple: 'hover:shadow-purple-500/20',
              orange: 'hover:shadow-orange-500/20',
            };

            return (
              <div 
                key={stat.label} 
                className={`bg-white rounded-xl border-l-4 ${borderColors[stat.color as keyof typeof borderColors]} shadow-sm hover:shadow-lg ${shadowColors[stat.color as keyof typeof shadowColors]} transition-all duration-300 p-4 hover:scale-105 cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1.5 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${bgColors[stat.color as keyof typeof bgColors]} rounded-xl flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-6 h-6 ${textColors[stat.color as keyof typeof textColors]}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Forms */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Forms</h2>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all">
              View All
            </button>
          </div>
          <div className="p-4">
            {recentForms.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No forms created yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentForms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200/50 hover:shadow-md group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{form.title}</p>
                        <p className="text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium text-blue-600">{form.submission_count || 0}</span> submissions
                          </span>
                          <span className="mx-1.5">•</span> 
                          Updated {new Date(form.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setPreviewForm(form)}
                        className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-all hover:scale-110 hover:shadow-md"
                        title="View form"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => router.push(`/admin/form-builder?slug=${form.slug}`)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-all hover:scale-110 hover:shadow-md"
                        title="Edit form"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteForm(form.slug)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all hover:scale-110 hover:shadow-md"
                        title="Delete form (disabled)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Preview Modal */}
        <FormViewModal form={previewForm} onClose={() => setPreviewForm(null)} />
        <NotAuthenticatedModal isOpen={notAuth} onClose={() => setNotAuth(false)} />
      </div>
    </div>
  );
}
