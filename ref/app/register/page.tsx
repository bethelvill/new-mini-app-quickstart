'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSignup, useVerifyGoogleToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  User,
  Mail,
  Lock,
  Gift,
  Sparkles,
  Crown,
  Coins,
  ArrowRight,
  CheckCircle,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { useAuthStore } from '@/stores/authStore';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name needs at least 2 characters'),
    // username: z.string().min(3, 'Username needs at least 3 characters'),
    email: z.string().email('Drop a valid email address'),
    password: z.string().min(8, 'Password needs at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match fam",
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const { setUser, updateAdmin, updateBalance, updateSubAdmin } =
    useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const watchPassword = watch('password', '');

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    const pass = watchPassword || password;
    if (!pass) return { score: 0, label: 'Enter password', color: 'gray' };

    let score = 0;
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[@?#&%$!*(),.":{}|<>^~`\-_+=\[\]\\\/;']/.test(pass),
    };

    if (checks.length) score++;
    if (pass.length >= 8) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    if (score <= 2)
      return { score: 1, label: 'Weak', color: 'red', percentage: 25 };
    if (score <= 3)
      return { score: 2, label: 'Fair', color: 'orange', percentage: 50 };
    if (score <= 5)
      return { score: 3, label: 'Good', color: 'amber', percentage: 75 };
    return { score: 4, label: 'Strong', color: 'emerald', percentage: 100 };
  }, [watchPassword, password]);

  const signupMutation = useSignup();
  const googleAuthMutation = useVerifyGoogleToken();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const result = await googleAuthMutation.mutateAsync(
        credentialResponse.credential
      );

      if (result.data) {
        // Check if it's a new user (for analytics or onboarding)
        if (result.data.isNewUser) {
          console.log('New user signed up via Google');
          // You can add specific new user onboarding here if needed
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

        // No need to fetch wallet balance here - it will be fetched when user reaches authenticated pages

        toast.success('Welcome to ShowStakr! 🎉');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Google signup failed:', error);
      toast.error('Google signup failed. Please try again.');
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    signupMutation.mutate(
      {
        username: `${data.name.split(' ')[0]}${Math.floor(
          Math.random() * 1000
        )}${data.name.split(' ').slice(1).join(' ')}${Math.floor(
          Math.random() * 1000
        )}`,
        firstName: data.name.split(' ')[0] || data.name,
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        email: data.email.toLowerCase(),
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success('Welcome to the squad! Check your email to verify 📧');
          router.push(`/verify-email?email=${data.email}`);
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Something went wrong. Try again!', {
            duration: 3000,
          });
        },
      }
    );
  };

  const benefits = [
    {
      icon: Coins,
      text: 'Start Competing Instantly',
      color: 'text-emerald-400',
    },
    { icon: Crown, text: 'Battle Other Players', color: 'text-purple-400' },
    { icon: Star, text: 'Win Their Money', color: 'text-amber-400' },
  ];

  return (
    <div className='min-h-screen bg-black flex items-center justify-center p-3 sm:p-4 relative overflow-hidden'>
      {/* Animated Background */}
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-violet-950/30 via-black to-pink-950/30' />
        <div className='absolute top-0 right-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-0 left-1/3 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000' />
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-pulse delay-500' />
      </div>

      {/* Main Container */}
      <div className='relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-6 lg:gap-8 px-2 sm:px-0'>
        {/* Benefits Section - Hidden on mobile */}
        <div className='hidden lg:flex flex-col justify-center lg:w-1/2 p-6 xl:p-8'>
          <h2 className='text-3xl xl:text-4xl font-black mb-6 xl:mb-8'>
            <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
              Join The Battle Arena
            </span>
          </h2>
          <div className='space-y-6'>
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className='flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all'
              >
                <div className='p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20'>
                  <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                </div>
                <div>
                  <p className='text-white font-semibold text-lg'>
                    {benefit.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className='mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20'>
            <div className='flex items-center gap-3 mb-3'>
              <Gift className='w-6 h-6 text-amber-400' />
              <span className='text-amber-400 font-bold text-xl'>
                Player vs Player!
              </span>
            </div>
            <p className='text-gray-300'>
              Compete directly with other players. Winners split the
              losers&apos; stakes!
            </p>
          </div>
        </div>

        {/* Register Form */}
        <div className='w-full lg:w-1/2 max-w-md mx-auto lg:max-w-none'>
          <div className='text-center mb-4 sm:mb-6'>
            <div className='inline-flex items-center justify-center mb-3 sm:mb-4'>
              <Image
                src='https://res.cloudinary.com/dnvsfxlan/image/upload/v1734824130/Group_1000001891_2_tybmb9.svg'
                alt='ShowStakr'
                width={80}
                height={80}
                className='w-16 h-16 sm:w-20 sm:h-20'
              />
            </div>
            <h1 className='text-2xl sm:text-3xl font-black mb-2'>
              <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
                Create Your Account
              </span>
            </h1>
            <p className='text-gray-400 text-sm sm:text-base'>
              Start competing in 30 seconds
            </p>
          </div>

          {/* Mobile Benefits - Shown only on mobile */}
          <div className='lg:hidden mb-4 sm:mb-6'>
            <div className='flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30'>
              <Gift className='w-5 h-5 text-amber-400' />
              <span className='text-amber-400 font-bold'>
                Join Player Battles!
              </span>
            </div>
          </div>

          <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl'>
            {/* Google OAuth Button - Moved to top */}
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast.error('Google signup failed. Please try again.');
              }}
              text='signup_with'
            />

            {/* OAuth Divider */}
            <div className='relative my-4 sm:my-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-white/10'></div>
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-black px-3 text-gray-500'>
                  Or signup with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-3.5'>
              <div className='space-y-2'>
                <Label
                  htmlFor='name'
                  className='text-gray-300 font-medium text-sm'
                >
                  Full Name
                </Label>
                <div className='relative group'>
                  <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-violet-400 transition-colors' />
                  <Input
                    id='name'
                    type='text'
                    placeholder='John Doe'
                    className='pl-10 h-10 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 transition-all text-sm'
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className='text-pink-400 text-xs flex items-center gap-1'>
                    <Sparkles className='w-3 h-3' />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* <div className='space-y-2'>
                <Label
                  htmlFor='username'
                  className='text-gray-300 font-medium text-sm'
                >
                  Username
                </Label>
                <div className='relative group'>
                  <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium group-focus-within:text-violet-400 transition-colors text-sm'>
                    @
                  </span>
                  <Input
                    id='username'
                    type='text'
                    placeholder='johndoe'
                    className='pl-8 h-10 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 transition-all text-sm'
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <p className='text-pink-400 text-xs flex items-center gap-1'>
                    <Sparkles className='w-3 h-3' />
                    {errors.username.message}
                  </p>
                )}
              </div> */}

              <div className='space-y-2'>
                <Label
                  htmlFor='email'
                  className='text-gray-300 font-medium text-sm'
                >
                  Email Address
                </Label>
                <div className='relative group'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-violet-400 transition-colors' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='john@example.com'
                    className='pl-10 h-10 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 transition-all text-sm'
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className='text-pink-400 text-xs flex items-center gap-1'>
                    <Sparkles className='w-3 h-3' />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='password'
                    className='text-gray-300 font-medium text-sm'
                  >
                    Password
                  </Label>
                  <div className='relative group'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-violet-400 transition-colors' />
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      className='pl-10 h-10 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 transition-all text-sm'
                      {...register('password', {
                        onChange: (e) => setPassword(e.target.value),
                      })}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xs'
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  {/* Password Requirements - Mobile Optimized */}
                  {(watchPassword || password) && (
                    <div className='space-y-2 p-2.5 rounded-lg bg-white/5 border border-white/10'>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-xs text-gray-400'>Strength</span>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.color === 'red'
                              ? 'text-red-400'
                              : passwordStrength.color === 'orange'
                              ? 'text-orange-400'
                              : passwordStrength.color === 'amber'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className='w-full h-1.5 bg-white/10 rounded-full overflow-hidden'>
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.color === 'red'
                              ? 'bg-red-500'
                              : passwordStrength.color === 'orange'
                              ? 'bg-orange-500'
                              : passwordStrength.color === 'amber'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${passwordStrength.percentage}%` }}
                        />
                      </div>
                      <div className='grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs'>
                        <div
                          className={`flex items-center gap-1 ${
                            (watchPassword || password).length >= 8
                              ? 'text-emerald-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {(watchPassword || password).length >= 8 ? '✓' : '○'}{' '}
                          8+ chars
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            /[A-Z]/.test(watchPassword || password) &&
                            /[a-z]/.test(watchPassword || password)
                              ? 'text-emerald-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {/[A-Z]/.test(watchPassword || password) &&
                          /[a-z]/.test(watchPassword || password)
                            ? '✓'
                            : '○'}{' '}
                          Aa
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            /[0-9]/.test(watchPassword || password)
                              ? 'text-emerald-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {/[0-9]/.test(watchPassword || password) ? '✓' : '○'}{' '}
                          123
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            /[@?#&%$!*(),.":{}|<>^~`\-_+=\[\]\\\/;']/.test(
                              watchPassword || password
                            )
                              ? 'text-emerald-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {/[@?#&%$!*(),.":{}|<>^~`\-_+=\[\]\\\/;']/.test(
                            watchPassword || password
                          )
                            ? '✓'
                            : '○'}{' '}
                          !@#
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className='text-pink-400 text-xs flex items-center gap-1'>
                      <Sparkles className='w-3 h-3' />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='confirmPassword'
                    className='text-gray-300 font-medium text-sm'
                  >
                    Confirm Password
                  </Label>
                  <div className='relative group'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-violet-400 transition-colors' />
                    <Input
                      id='confirmPassword'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      className='pl-10 h-10 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 transition-all text-sm'
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className='text-pink-400 text-xs flex items-center gap-1'>
                      <Sparkles className='w-3 h-3' />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type='submit'
                disabled={signupMutation.isPending}
                className='w-full h-10 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/25 transform hover:scale-[1.02] transition-all'
              >
                {signupMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    Creating your account...
                  </>
                ) : (
                  <>
                    Join The Squad
                    <ArrowRight className='ml-2 w-5 h-5' />
                  </>
                )}
              </Button>
            </form>

            <div className='mt-4 sm:mt-6 text-center'>
              <p className='text-gray-400 text-sm sm:text-base'>
                Already winning?{' '}
                <Link
                  href='/login'
                  className='text-transparent bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text font-bold hover:from-violet-300 hover:to-pink-300 transition-all'
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className='mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10'>
              <p className='text-center text-xs text-gray-500'>
                By signing up, you agree to our terms and compete responsibly
              </p>
              <p className='text-center text-xs text-gray-600 mt-2 italic'>
                Independent platform • Not affiliated with any TV networks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
