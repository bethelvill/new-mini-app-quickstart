'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin, useVerifyGoogleToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Star,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useUserProfile, useWalletBalance } from '@/lib';
import { useState } from 'react';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { resetRedirectFlag } from '@/lib/api';
import { trackUserLogin, setUserProperties } from '@/lib/analytics';

const loginSchema = z.object({
  email: z.string().email('Drop a valid email fam'),
  password: z.string().min(8, 'Password needs at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { setUser, updateAdmin, updateBalance, updateSubAdmin } =
    useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const walletBalance = useWalletBalance(false); // Don't fetch on login page
  const loginMutation = useLogin();
  const getUserProfile = useUserProfile(false); // Don't fetch on login page
  const googleAuthMutation = useVerifyGoogleToken();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // Send the access token to the backend
      const result = await googleAuthMutation.mutateAsync(credentialResponse.credential);

      if (result.data) {
        // Reset the redirect flag on successful login
        resetRedirectFlag();

        // Check if it's a new user (for analytics or onboarding)
        if (result.data.isNewUser) {
          console.log('New user signed up via Google');
          // You can add specific new user tracking here if needed
        }

        // Set user data in auth store
        setUser(result.data.user);

        // Check for admin roles
        if (
          result.data.user.roles?.includes('admin') ||
          result.data.user.roles?.includes('super_admin')
        ) {
          updateAdmin(true);
          updateSubAdmin(false);
        } else if (result.data.user.roles?.includes('sub_admin')) {
          updateAdmin(false);
          updateSubAdmin(true);
        } else {
          updateAdmin(false);
          updateSubAdmin(false);
        }

        // Fetch wallet balance
        await walletBalance.refetch().then((data: any) => {
          if (data?.data?.data) {
            updateBalance(data.data.data.totalBalance || 0);
          }
        });

        // Track login event
        trackUserLogin('google', result.data.user.id);
        setUserProperties({
          email: result.data.user.email,
          firstName: result.data.user.firstName,
          lastName: result.data.user.lastName,
          role: result.data.user.roles?.join(','),
        });

        toast.success('Welcome back! 🎉');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Google login failed:', error);
      toast.error('Google login failed. Please try again.');
    }
  };

  const onSubmit = async (data: LoginForm) => {
    await loginMutation.mutateAsync(
      { email: data.email.toLowerCase(), password: data.password },
      {
        onSuccess: async (data) => {
          // Reset the redirect flag on successful login
          resetRedirectFlag();
          await getUserProfile.refetch().then(async (profileData: any) => {
            setUser(profileData.data?.data);
            if (
              profileData.data?.data.roles.includes('admin') ||
              profileData.data?.data.roles.includes('super_admin')
            ) {
              updateAdmin(true);
              updateSubAdmin(false);
            }
            if (profileData.data?.data.roles.includes('sub_admin')) {
              updateAdmin(false);
              updateSubAdmin(true);
            }
            await walletBalance.refetch().then(async (balanceData: any) => {
              updateBalance(balanceData.data?.data?.totalBalance || 0);
            });
            
            // Track login event
            trackUserLogin('email', profileData.data?.data.id);
            setUserProperties({
              email: profileData.data?.data.email,
              firstName: profileData.data?.data.firstName,
              lastName: profileData.data?.data.lastName,
              role: profileData.data?.data.roles?.join(','),
            });
          });
          toast.success("Welcome back champion! Let's get this bread 🚀");
          router.push('/dashboard');
        },
        onError: (error: any) => {
          if (
            (error as Error).message ===
            'Email not verified. A verify mail has been resent to this email.'
          ) {
            toast.error('Check your inbox to verify your email first!', {
              duration: 3000,
            });
            router.push(`/verify-email?email=${data.email}`);
          }

          toast.error(
            (error as Error).message || 'Something went wrong. Try again!',
            { duration: 3000 }
          );
        },
      }
    );
  };

  return (
    <div className='min-h-screen bg-black flex items-center justify-center p-3 sm:p-4 relative overflow-hidden'>
      {/* Animated Background */}
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-violet-950/30 via-black to-pink-950/30' />
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000' />
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-500' />
      </div>

      {/* Floating Elements */}
      <div className='hidden sm:block absolute top-20 left-20 text-violet-500/20 animate-float'>
        <Trophy className='w-8 sm:w-12 h-8 sm:h-12' />
      </div>
      <div className='hidden sm:block absolute top-40 right-10 sm:right-32 text-pink-500/20 animate-float delay-1000'>
        <Star className='w-6 sm:w-8 h-6 sm:h-8' />
      </div>
      <div className='hidden sm:block absolute bottom-32 left-10 sm:left-32 text-orange-500/20 animate-float delay-500'>
        <TrendingUp className='w-8 sm:w-10 h-8 sm:h-10' />
      </div>

      {/* Login Card */}
      <div className='relative z-10 w-full max-w-sm sm:max-w-md px-2 sm:px-0'>
        <div className='text-center mb-6 sm:mb-8'>
          <div className='inline-flex items-center justify-center mb-3 sm:mb-4'>
            <Image
              src='https://res.cloudinary.com/dnvsfxlan/image/upload/v1734824130/Group_1000001891_2_tybmb9.svg'
              alt='ShowStakr'
              width={80}
              height={80}
              className='w-16 h-16 sm:w-20 sm:h-20'
            />
          </div>
          <h1 className='text-3xl sm:text-4xl font-black mb-2'>
            <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
              Welcome Back!
            </span>
          </h1>
          <p className='text-gray-400 text-sm sm:text-base'>
            Ready to predict and win big?
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl'>
          {/* Google OAuth Button - Moved to top */}
          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            onError={() => {
              toast.error('Google login failed. Please try again.');
            }}
            text='signin_with'
          />

          {/* OAuth Divider */}
          <div className='relative my-6 sm:my-8'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-white/10'></div>
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-black px-3 text-gray-500'>
                Or login with email
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-4 sm:space-y-6'
          >
            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-gray-300 font-medium text-sm sm:text-base'
              >
                Email Address
              </Label>
              <div className='relative group'>
                <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-violet-400 transition-colors' />
                <Input
                  id='email'
                  type='email'
                  placeholder='your@email.com'
                  className='pl-12 h-10 sm:h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 transition-all text-sm sm:text-base'
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className='text-pink-400 text-sm flex items-center gap-1'>
                  <Sparkles className='w-3 h-3' />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='password'
                  className='text-gray-300 font-medium text-sm sm:text-base'
                >
                  Password
                </Label>
                <Link
                  href='/forgot-password'
                  className='text-xs sm:text-sm text-violet-400 hover:text-violet-300 transition-colors'
                >
                  Forgot?
                </Link>
              </div>
              <div className='relative group'>
                <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-violet-400 transition-colors' />
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  className='pl-12 pr-12 h-10 sm:h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 transition-all text-sm sm:text-base'
                  {...register('password')}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors'
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className='text-pink-400 text-sm flex items-center gap-1'>
                  <Sparkles className='w-3 h-3' />
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type='submit'
              disabled={loginMutation.isPending}
              className='w-full h-10 sm:h-12 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-purple-500/25 transform hover:scale-[1.02] transition-all'
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  Logging you in...
                </>
              ) : (
                <>
                  Let&apos;s Go
                  <ArrowRight className='ml-2 w-5 h-5' />
                </>
              )}
            </Button>
          </form>

          <div className='mt-6 sm:mt-8 text-center'>
            <p className='text-gray-400 text-sm sm:text-base'>
              New to the game?{' '}
              <Link
                href='/register'
                className='text-transparent bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text font-bold hover:from-violet-300 hover:to-pink-300 transition-all'
              >
                Join the squad
              </Link>
            </p>
          </div>

          <div className='mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10'>
            <p className='text-center text-xs text-gray-500'>
              By signing in, you agree to predict responsibly 🎯
            </p>
            <p className='text-center text-xs text-gray-600 mt-2 italic'>
              Independent platform • Not affiliated with any TV networks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
