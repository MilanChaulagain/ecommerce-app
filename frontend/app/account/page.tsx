"use client";

import RoleHomeWrapper from '@/components/home/RoleHomeWrapper';
import UserHomePage from '@/components/user/UserHomePage';

export default function AccountPage() {
	return (
		<RoleHomeWrapper>
			<div className="p-6">
				<UserHomePage />
			</div>
		</RoleHomeWrapper>
	);
}
