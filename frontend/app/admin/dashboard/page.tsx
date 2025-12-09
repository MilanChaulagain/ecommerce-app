'use client';

import { useEffect, useState } from 'react';
import { FileText, Users, TrendingUp, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient, { FormSchema } from '@/lib/api-client';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalForms: 0,
    totalSubmissions: 0,
    activeUsers: 0,
    pendingReviews: 0,
  });
  const [recentForms, setRecentForms] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        activeUsers: 1245, // Mock data
        pendingReviews: 23, // Mock data
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      
      // If unauthorized, redirect to login
      if (error.status === 401) {
        router.push('/admin/login');
      }
    }
  };

  const handleDeleteForm = async (formSlug: string) => {
    // Note: Backend has DELETE disabled (returns 403)
    // This function is kept for future use if DELETE is enabled
    alert('Delete functionality is currently disabled by the backend.');
    
    // Uncomment when backend enables DELETE
    /*
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      await apiClient.forms.deleteForm(formSlug);
      alert('Form deleted successfully');
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      console.error('Error deleting form:', error);
      alert(`Failed to delete form: ${error?.data?.detail || error.message}`);
    }
    */
  };

  const statCards = [
    { label: 'Total Forms', value: stats.totalForms, icon: FileText, color: 'blue' },
    { label: 'Submissions', value: stats.totalSubmissions, icon: TrendingUp, color: 'green' },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'purple' },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'orange' },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Overview of your admin portal</p>
        </div>
        <button
          onClick={() => router.push('/admin/form-builder')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-md hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Form
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

          return (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${bgColors[stat.color as keyof typeof bgColors]} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${textColors[stat.color as keyof typeof textColors]}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Forms */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Forms</h2>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="p-4">
          {recentForms.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">No forms created yet</p>
          ) : (
            <div className="space-y-2">
              {recentForms.map((form) => (
                <div
                  key={form.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{form.title}</p>
                      <p className="text-xs text-gray-500">
                        {form.submission_count || 0} submissions • 
                        Updated {new Date(form.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => router.push(`/admin/form-builder?slug=${form.slug}`)}
                      className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                      title="Edit form"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteForm(form.slug)}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                      title="Delete form (disabled)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
