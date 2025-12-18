"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/lib/api-client';
import ProfileForm from './ProfileForm';
import AdminHome from './AdminHome';
import CustomerHome from './CustomerHome';
import EmployeeHome from './EmployeeHome';

export default function UserHomePage() {
	const [summary, setSummary] = useState<any | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	// Profile state
	const [profileValues, setProfileValues] = useState<any[] | null>(null);
	const [showProfileForm, setShowProfileForm] = useState<boolean>(false);
	const [profileLoading, setProfileLoading] = useState<boolean>(false);
	const [profileError, setProfileError] = useState<string | null>(null);
	const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
	const avatarInputRef = useRef<HTMLInputElement | null>(null);
	const [focusFieldId, setFocusFieldId] = useState<number | null>(null);

	const loadProfile = async () => {
		setProfileLoading(true);
		setProfileError(null);
		try {
			const res = await apiClient.user.viewProfile();
			setProfileValues(res.data || res);
		} catch (e: any) {
			setProfileError(e?.data?.message || e?.message || 'Failed to load profile');
			setProfileValues(null);
		} finally {
			setProfileLoading(false);
		}
	};

	const load = async () => {
		setLoading(true);
		try {
			const data = await apiClient.user.getHome();
			// Debug: log the raw payload to help diagnose role issues
			if (typeof window !== 'undefined') console.debug('[UserHome] /api/user/home response:', data);
			setSummary(data);
			// Load profile values for current user
			await loadProfile();
		} catch (err) {
			console.error('Failed to load user home', err);
		} finally {
			setLoading(false);
		}
	};

	const handleAvatarSelect = async (file: File | null) => {
		if (!file) return;
		setUploadingAvatar(true);
		try {
			const res = await apiClient.user.uploadProfilePicture(file);
			const avatarUrl = res?.avatar || res?.data?.avatar || null;
			setSummary((s: any) => ({ ...s, user: { ...s.user, avatar: avatarUrl } }));
			// refresh profile preview
			try { await loadProfile(); } catch {}
		} catch (e) {
			console.error('Failed to upload avatar', e);
		} finally {
			setUploadingAvatar(false);
		}
	};

	const onMissingFieldComplete = (fieldId: number) => {
		setFocusFieldId(fieldId);
		setShowProfileForm(true);
	};

	useEffect(() => {
		load();
	}, []);

	// Mobile detection for alternate layout
	const [isMobile, setIsMobile] = useState<boolean>(false);
	useEffect(() => {
		const check = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	}, []);

	// lock scroll when mobile form open
	useEffect(() => {
		if (isMobile) {
			document.body.style.overflow = showProfileForm ? 'hidden' : '';
		}
		return () => { document.body.style.overflow = ''; };
	}, [isMobile, showProfileForm]);

	if (loading) return <div>Loading…</div>;

	// Resolve role from multiple possible sources (backwards-compatible fallbacks)
	const rawRole = summary?.user?.role ?? summary?.user?.role_name ?? (Array.isArray(summary?.user?.groups) ? (summary?.user?.groups[0]?.name ?? null) : null) ?? 'user';
	const role = String(rawRole || 'user').toLowerCase();

	return (
		<div className="max-w-7xl mx-auto px-4">
			{isMobile ? (
				// Mobile-first layout: colorful header + stacked animated cards + slide-up form
				<div className="space-y-4">
					<motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45 }} className="rounded-lg overflow-hidden shadow-lg">
						<div className="bg-gradient-to-r from-pink-500 via-indigo-600 to-indigo-400 p-5">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-semibold">{String(summary?.user?.username ?? summary?.user?.email ?? 'U').charAt(0).toUpperCase()}</div>
									<div>
										<div className="text-white font-semibold leading-tight">{summary?.user?.username || summary?.user?.email || 'User'}</div>
										<div className="text-white/80 text-sm">{summary?.user?.email}</div>
									</div>
								</div>
								<button onClick={() => setShowProfileForm(true)} className="bg-white/90 text-indigo-700 px-3 py-2 rounded-md shadow-sm text-sm font-medium">Add details</button>
							</div>
							<div className="mt-3 flex items-center gap-3">
								<motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} className="bg-white/20 text-white rounded-full px-3 py-1 text-xs font-semibold">{String(rawRole || 'user').toUpperCase()}</motion.div>
								<div className="text-white/90 text-sm">Profile completion: <strong className="font-semibold">{summary?.stats?.completion_percentage ?? 0}%</strong></div>

						{/* Small preview (mobile) */}
						{summary?.profile_preview && summary.profile_preview.length > 0 && (
							<div className="mt-3 flex gap-3">
								{summary.profile_preview.map((p: any) => (
									<div key={p.field_id} className="bg-white/10 px-3 py-1 rounded text-sm text-white max-w-xs">
										<div className="font-semibold text-sm">{p.field_label}</div>
										<div className="text-xs text-white/80 truncate">{p.value}</div>
									</div>
								))}
							</div>
						)}

						{/* Suggestions (mobile) */}
						{summary?.suggestions && summary.suggestions.length > 0 && (
							<div className="mt-3 flex gap-2">
								{summary.suggestions.map((s: any) => (
									<button key={s.code} onClick={() => { if (s.code === 'upload_avatar') avatarInputRef?.current?.click(); else setShowProfileForm(true); }} className="px-3 py-1 bg-white/20 text-white rounded text-xs">{s.label}</button>
								))}
							</div>
						)}
							</div>
						</div>
					</motion.header>

					{/* Profile values: stacked animated cards */}
					<section className="space-y-3">
						{profileLoading ? (
							<div className="p-4 rounded bg-white shadow">Loading profile…</div>
						) : profileError ? (
							<div className="p-4 rounded bg-red-50 text-red-700">{profileError}</div>
						) : (profileValues && profileValues.length ? (
							<motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: {} }} className="space-y-3">
								{profileValues.map((pv, idx) => (
									<motion.div key={pv.id} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.06 }} className="p-4 rounded-lg bg-white shadow-sm border border-gray-100">
										<div className="flex items-center justify-between">
											<div>
												<div className="text-sm font-medium text-gray-800">{pv.field_label}</div>
												<div className="text-sm text-gray-500 mt-1">{pv.value}</div>
											</div>
											<span className="text-xs text-indigo-600 font-semibold">Profile</span>
										</div>
									</motion.div>
								))}
							</motion.div>
						) : (
							<div className="p-4 rounded bg-white shadow text-sm text-gray-600">No profile data yet — tap <strong>Add details</strong> to create your profile.</div>
						))}
					</section>

					{/* Role-specific components follow after profile stack */}
					<div className="mt-3">
						{role === 'admin' && <AdminHome summary={summary} />}
						{role === 'employee' && <EmployeeHome summary={summary} onProfileSaved={load} />}
						{(role === 'user' || role === 'customer') && <CustomerHome summary={summary} onProfileSaved={load} />}
					</div>

					{/* Mobile full-screen slide-up form */}
					<AnimatePresence>
						{showProfileForm && (
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end">
								{/* backdrop */}
								<motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-black" onClick={() => { setShowProfileForm(false); setFocusFieldId(null); }} />
								{/* panel */}
								<motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 28 }} className="relative w-full bg-white rounded-t-xl p-4 shadow-xl">
									<div className="flex items-center justify-between">
										<div className="text-lg font-semibold">Complete your profile</div>
										<button onClick={() => { setShowProfileForm(false); setFocusFieldId(null); }} className="text-sm text-gray-600">Close</button>
									</div>
									<div className="mt-3">
										<ProfileForm onSaved={() => { load(); setShowProfileForm(false); }} />
									</div>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			) : (
				/* Desktop / larger screens: existing layout below */
				null
			)}
			{/* Top user summary and CTA */}
			<div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm mb-6 flex items-center gap-6">
				<div className="relative">
				<div className="w-16 h-16 rounded-full overflow-hidden bg-pink-600 ring-4 ring-pink-50 flex items-center justify-center text-white text-xl font-semibold">
					{summary?.user?.avatar ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={summary.user.avatar} alt="avatar" className="w-full h-full object-cover" />
					) : (
						<div>{String(summary?.user?.username ?? summary?.user?.email ?? 'U').charAt(0).toUpperCase()}</div>
					)}
				</div>
				<div className="absolute -bottom-1 -right-1">
					<button onClick={() => avatarInputRef?.current?.click()} className="bg-white text-indigo-700 rounded-full p-1 text-xs shadow-sm">Change</button>
				</div>
				<input ref={(el) => (avatarInputRef.current = el)} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0] ?? null; if (f) handleAvatarSelect(f); }} className="hidden" />
			</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-4">
						<div className="min-w-0">
							<div className="text-lg font-semibold text-gray-900 truncate">{summary?.user?.username || summary?.user?.email || 'User'}</div>
							<div className="text-sm text-gray-500 truncate">{summary?.user?.email}</div>
						</div>
						<div>
							<span className="inline-flex items-center px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-medium uppercase">{String(rawRole || 'user').toUpperCase()}</span>
						</div>
					</div>
					<div className="mt-2 text-sm text-gray-600">Profile completion: <strong className="text-gray-800">{summary?.stats?.completion_percentage ?? 0}%</strong></div>
				</div>

				<div className="ml-auto">
					<button onClick={() => setShowProfileForm(s => !s)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 text-white rounded-md shadow-sm transition">Add details / Create profile to earn</button>
				</div>
			</div>

			{/* When the form is opened, show a two-column split: left = details, right = animated form */}
			<AnimatePresence>
				{showProfileForm ? (
					<motion.div key="split" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6">
						<div className="flex flex-col md:flex-row gap-0">
							{/* Left: user details and profile values */}
							<motion.div layout className="flex-1 bg-white border border-gray-100 p-6 rounded-lg shadow-sm">
								<div className="flex items-start justify-between gap-4">
									<div>
										<h3 className="text-lg font-semibold text-gray-900">{summary?.user?.username || summary?.user?.email || 'User'}</h3>
										<p className="text-sm text-gray-500">{summary?.user?.email}</p>
									</div>
									<button onClick={() => setShowProfileForm(false)} className="ml-2 text-sm text-gray-500 hover:text-gray-700">Close</button>
								</div>
								<div className="mt-4">
									{profileLoading ? (
										<div>Loading profile…</div>
									) : profileError ? (
										<div className="text-red-600">{profileError}</div>
									) : (profileValues && profileValues.length ? (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{profileValues.map(pv => (
												<div key={pv.id} className="p-4 bg-gray-50 rounded border border-gray-100">
													<div className="text-sm font-medium text-gray-700">{pv.field_label}</div>
													<div className="text-sm text-gray-600 mt-1">{pv.value}</div>
												</div>
											))}
										</div>
									) : (
										<div className="text-sm text-gray-500">No profile data yet. Fill the form on the right to create your profile.</div>
									))}
								</div>
							</motion.div>

							{/* Right: animated form panel */}
							<motion.aside layout initial={{ x: 600, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 600, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="md:w-[40rem] w-full">
								<div className="bg-white border border-gray-100 p-6 rounded-lg shadow-lg h-full">
									<h2 className="text-lg font-medium mb-4 text-gray-900">Complete your profile</h2>
									<ProfileForm onSaved={() => { load(); setShowProfileForm(false); }} />
								</div>
							</motion.aside>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>

			{/* If the form is not open, show the normal profile values summary */}
			{!showProfileForm && (
				<div className="bg-white border border-gray-100 p-6 rounded-lg shadow-sm mb-6">
					<h3 className="text-md font-semibold mb-4 text-gray-900">Your Profile Details</h3>
					{profileLoading ? (
						<div>Loading profile…</div>
					) : profileError ? (
						<div className="text-red-600">{profileError}</div>
					) : (profileValues && profileValues.length ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{profileValues.map(pv => (
								<div key={pv.id} className="p-4 bg-gray-50 rounded border border-gray-100">
									<div className="text-sm font-medium text-gray-700">{pv.field_label}</div>
									<div className="text-sm text-gray-600 mt-1">{pv.value}</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-sm text-gray-500">No profile data yet. Click <strong>Add details / Create profile to earn</strong> to create your profile.</div>
					))}
				</div>
			)}

			{/* Role-based home components
			{role === 'admin' && <AdminHome summary={summary} />}
			{role === 'employee' && <EmployeeHome summary={summary} onProfileSaved={load} />}
			{role === 'user' && <CustomerHome summary={summary} onProfileSaved={load} />}
			{role === 'customer' && <CustomerHome summary={summary} onProfileSaved={load} />} */}

			{/* Fallback for any other role: show message and button to open the profile editor */}
			{!['admin','employee','user','customer'].includes(role) && (
				<div className="bg-white p-6 rounded shadow mt-6">
					<h2 className="text-lg font-medium mb-3">Profile</h2>
					<p className="text-sm text-gray-600 mb-4">Your account role is <strong className="font-semibold">{role}</strong>. Click the button below to manage your profile.</p>
					<button onClick={() => setShowProfileForm(true)} className="px-3 py-2 bg-indigo-600 text-white rounded">Create / Edit Profile</button>
				</div>
			)}
		</div>
	);
}
