import React from 'react'

import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileMenu from '@/components/profile/ProfileMenu';

const ProfilePage = () => {
  return (
    <div>
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto p-4 pb-24">
        <ProfileHeader />
        <ProfileStats />
        <ProfileMenu />
      </div>
    </div>
  );
};

export default ProfilePage;
