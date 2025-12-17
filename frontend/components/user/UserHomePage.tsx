"use client";

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import ProfileForm from './ProfileForm';
import AdminHome from './AdminHome';
import CustomerHome from './CustomerHome';
import EmployeeHome from './EmployeeHome';

export default function UserHomePage() {
	const [summary, setSummary] = useState<any | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const load = async () => {
		setLoading(true);
		try {
			const data = await apiClient.user.getHome();
			setSummary(data);
		} catch (err) {
			console.error('Failed to load user home', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	if (loading) return <div>Loading…</div>;

	const role = summary?.user?.role || 'user';

	return (
		<div className="max-w-5xl mx-auto">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-semibold text-pink-600">Your Home</h1>
				<div className="text-sm text-gray-500">Welcome back — manage your profile below</div>
			</div>

			{role === 'admin' && <AdminHome summary={summary} />}
			{role === 'employee' && <EmployeeHome summary={summary} onProfileSaved={load} />}
			{role === 'user' && <CustomerHome summary={summary} onProfileSaved={load} />}

			{/* Fallback profile area for other roles */}
			{['superemployee'].includes(role) && (
				<div className="bg-white p-6 rounded shadow mt-6">
					<h2 className="text-lg font-medium mb-3">Profile</h2>
					<ProfileForm onSaved={load} />
				</div>
			)}
		</div>
	);
}
