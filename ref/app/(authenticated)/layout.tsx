'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUserProfile, useWalletBalance } from '@/lib';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, updateAdmin, updateSubAdmin, updateBalance } =
    useAuthStore();
  const [hasToken, setHasToken] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for auth token on client side only
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setHasToken(!!token);
    setIsCheckingAuth(false);

    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Fetch user profile and balance only when authenticated
  const {
    data: profileData,
    isSuccess: profileSuccess,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(hasToken);

  const { data: balanceData, isSuccess: balanceSuccess } =
    useWalletBalance(hasToken);

  // Update user data when profile is fetched successfully
  useEffect(() => {
    if (profileSuccess && profileData?.data) {
      setUser(profileData.data);

      // Check if user has admin or sub-admin role
      if (
        profileData.data.roles?.includes('admin') ||
        profileData.data.roles?.includes('super_admin')
      ) {
        updateAdmin(true);
        updateSubAdmin(false);
      } else if (profileData.data.roles?.includes('sub_admin')) {
        updateAdmin(false);
        updateSubAdmin(true);
      } else {
        updateAdmin(false);
        updateSubAdmin(false);
      }
    }
  }, [profileData, profileSuccess, setUser, updateAdmin, updateSubAdmin]);

  // Update balance when wallet balance is fetched successfully
  useEffect(() => {
    if (balanceSuccess && balanceData?.data) {
      updateBalance(balanceData.data.totalBalance || 0);
    }
  }, [balanceData, balanceSuccess, updateBalance]);

  // Handle authentication errors
  useEffect(() => {
    if (profileError) {
      const error = profileError as any;
      // If we get a 401 or auth error, the global handler will take care of it
      // This is just a backup check
      if (
        error?.status === 401 ||
        error?.data?.errorCode === 'auth.invalid_token'
      ) {
        console.log('Auth error detected in authenticated layout');
      }
    }
  }, [profileError]);

  // Show loading state while checking authentication
  if (isCheckingAuth || (!hasToken && typeof window !== 'undefined')) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center flex flex-col items-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mb-4'></div>
          <p className='text-gray-400'>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (profileLoading && hasToken) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center flex flex-col items-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mb-4'></div>
          <p className='text-gray-400'>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
