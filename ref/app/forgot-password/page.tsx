'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Send,
  Sparkles,
  KeyRound,
  Shield,
  Info,
  Lock,
  ArrowRight,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useForgotPassword,
  useValidateForgotPasswordOtp,
  useResetPassword,
} from '@/lib/auth';

// Step 1: Email schema
const emailSchema = z.object({
  email: z.string().email('Drop a valid email address fam'),
});

// Step 2: Password schema with OTP
const passwordSchema = z
  .object({
    otp: z.string().min(6, 'Enter the 6-digit code from your email'),
    password: z.string().min(8, 'Password needs at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match fam",
    path: ['confirmPassword'],
  });

type EmailForm = z.infer<typeof emailSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();

  // Email form
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });


  // Password form
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const watchPassword = passwordForm.watch('password', '');

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
    if (pass.length >= 10) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;
    
    if (score <= 2) return { score: 1, label: 'Weak', color: 'red', percentage: 25 };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'orange', percentage: 50 };
    if (score <= 5) return { score: 3, label: 'Good', color: 'amber', percentage: 75 };
    return { score: 4, label: 'Strong', color: 'emerald', percentage: 100 };
  }, [watchPassword, password]);

  // Step 1: Submit email
  const handleEmailSubmit = async (data: EmailForm) => {
    const lowercaseEmail = data.email.toLowerCase();
    forgotPasswordMutation.mutate(
      { email: lowercaseEmail },
      {
        onSuccess: (response) => {
          setEmail(lowercaseEmail);
          toast.success('Reset code sent! Check your email 📧');
          setStep('password');
        },
        onError: (error: any) => {
          toast.error(
            error?.message || 'Failed to send reset code. Try again!'
          );
        },
      }
    );
  };


  // Step 2: Reset password with OTP
  const handlePasswordSubmit = async (data: PasswordForm) => {
    resetPasswordMutation.mutate(
      {
        otp: data.otp,
        email: email.toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: () => {
          toast.success(
            'Password reset successful! Sign in with your new password 🎉'
          );
          router.push('/login');
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              'Failed to reset password. Try again!'
          );
        },
      }
    );
  };

  const handleResendCode = () => {
    if (!email) return;

    forgotPasswordMutation.mutate(
      { email: email.toLowerCase() },
      {
        onSuccess: () => {
          toast.success('New code sent! Check your inbox 📬');
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Failed to resend code');
        },
      }
    );
  };

  return (
    <div className='min-h-screen bg-black flex items-center justify-center p-3 sm:p-4 relative overflow-hidden'>
      {/* Animated Background */}
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-violet-950/30 via-black to-pink-950/30' />
        <div className='absolute top-20 right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-20 left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000' />
      </div>

      <div className='relative z-10 w-full max-w-sm sm:max-w-md px-2 sm:px-0'>
        {/* Back Link */}
        <Link
          href='/login'
          className='inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8'
        >
          <ArrowLeft className='w-4 h-4' />
          <span>Back to login</span>
        </Link>

        <div className='text-center mb-6 sm:mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 mb-3 sm:mb-4 shadow-2xl shadow-purple-500/25'>
            <KeyRound className='w-8 h-8 sm:w-10 sm:h-10 text-white' />
          </div>
          <h1 className='text-2xl sm:text-3xl font-black mb-2'>
            <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
              Reset Your Password
            </span>
          </h1>
          <p className='text-gray-400 text-sm sm:text-base'>
            {step === 'email' && 'Enter your email to get started'}
            {step === 'password' && 'Enter the code from your email and create new password'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className='flex items-center justify-center gap-2 mb-6 sm:mb-8'>
          <div
            className={`w-12 h-1 rounded-full transition-all ${
              step === 'email' ? 'bg-violet-500' : 'bg-violet-500'
            }`}
          />
          <div
            className={`w-12 h-1 rounded-full transition-all ${
              step === 'password' ? 'bg-violet-500' : 'bg-white/20'
            }`}
          />
        </div>

        <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl'>
          {/* Step 1: Email Input */}
          {step === 'email' && (
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className='space-y-4 sm:space-y-6'
            >
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-gray-300 font-medium text-sm sm:text-base'>
                  Email Address
                </Label>
                <div className='relative group'>
                  <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-violet-400 transition-colors' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='your@email.com'
                    className='pl-12 h-10 sm:h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 transition-all text-sm sm:text-base'
                    {...emailForm.register('email')}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className='text-pink-400 text-sm flex items-center gap-1'>
                    <Sparkles className='w-3 h-3' />
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className='p-4 rounded-xl bg-white/5 border border-white/10'>
                <div className='flex items-center gap-3 text-sm'>
                  <Shield className='w-5 h-5 text-violet-400 flex-shrink-0' />
                  <p className='text-gray-400 text-sm sm:text-base'>
                    We&apos;ll send a 6-digit code to your email for
                    verification
                  </p>
                </div>
              </div>

              <Button
                type='submit'
                disabled={forgotPasswordMutation.isPending}
                className='w-full h-10 sm:h-12 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-purple-500/25 transform hover:scale-[1.02] transition-all'
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    Sending code...
                  </>
                ) : (
                  <>
                    Send Reset Code
                    <Send className='ml-2 w-5 h-5' />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Password Reset with OTP */}
          {step === 'password' && (
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className='space-y-4 sm:space-y-6'
            >
              <div className='p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 mb-6'>
                <div className='flex items-center gap-3'>
                  <Mail className='w-5 h-5 text-violet-400 flex-shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs text-gray-400 mb-1'>Code sent to:</p>
                    <p className='text-sm font-medium text-white truncate'>
                      {email}
                    </p>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label className='text-gray-300 font-medium text-sm sm:text-base'>
                  Enter 6-digit code from email
                </Label>
                <div className='relative group'>
                  <Hash className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-violet-400 transition-colors' />
                  <Input
                    type='text'
                    placeholder='000000'
                    maxLength={6}
                    className='pl-12 h-12 sm:h-14 text-center text-xl sm:text-2xl font-mono tracking-[0.3em] sm:tracking-[0.5em] bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 transition-all'
                    {...passwordForm.register('otp')}
                  />
                </div>
                {passwordForm.formState.errors.otp && (
                  <p className='text-pink-400 text-sm flex items-center gap-1'>
                    <AlertCircle className='w-3 h-3' />
                    {passwordForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='text-gray-300 font-medium text-sm sm:text-base'>
                  New Password
                </Label>
                <div className='relative group'>
                  <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-violet-400 transition-colors' />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter new password'
                    className='pl-12 pr-12 h-10 sm:h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 transition-all text-sm sm:text-base'
                    {...passwordForm.register('password', {
                      onChange: (e) => setPassword(e.target.value)
                    })}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors'
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {(watchPassword || password) && (
                  <div className='space-y-2 p-3 rounded-lg bg-white/5 border border-white/10'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-xs text-gray-400'>Strength</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.color === 'red' ? 'text-red-400' :
                        passwordStrength.color === 'orange' ? 'text-orange-400' :
                        passwordStrength.color === 'amber' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className='w-full h-1.5 bg-white/10 rounded-full overflow-hidden'>
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.color === 'red' ? 'bg-red-500' :
                          passwordStrength.color === 'orange' ? 'bg-orange-500' :
                          passwordStrength.color === 'amber' ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${passwordStrength.percentage}%` }}
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs'>
                      <div className={`flex items-center gap-1 ${(watchPassword || password).length >= 8 ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {(watchPassword || password).length >= 8 ? '✓' : '○'} 8+ chars
                      </div>
                      <div className={`flex items-center gap-1 ${/[A-Z]/.test(watchPassword || password) && /[a-z]/.test(watchPassword || password) ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {/[A-Z]/.test(watchPassword || password) && /[a-z]/.test(watchPassword || password) ? '✓' : '○'} Aa
                      </div>
                      <div className={`flex items-center gap-1 ${/[0-9]/.test(watchPassword || password) ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {/[0-9]/.test(watchPassword || password) ? '✓' : '○'} 123
                      </div>
                      <div className={`flex items-center gap-1 ${/[@?#&%$!*(),.":{}|<>^~`\-_+=\[\]\\\/;']/.test(watchPassword || password) ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {/[@?#&%$!*(),.":{}|<>^~`\-_+=\[\]\\\/;']/.test(watchPassword || password) ? '✓' : '○'} !@#
                      </div>
                    </div>
                  </div>
                )}
                
                {passwordForm.formState.errors.password && (
                  <p className='text-pink-400 text-sm flex items-center gap-1'>
                    <Sparkles className='w-3 h-3' />
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='text-gray-300 font-medium text-sm sm:text-base'>
                  Confirm New Password
                </Label>
                <div className='relative group'>
                  <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-violet-400 transition-colors' />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Confirm new password'
                    className='pl-12 pr-12 h-10 sm:h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 transition-all text-sm sm:text-base'
                    {...passwordForm.register('confirmPassword')}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors'
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className='text-pink-400 text-sm flex items-center gap-1'>
                    <Sparkles className='w-3 h-3' />
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className='p-4 rounded-xl bg-amber-500/10 border border-amber-500/30'>
                <div className='flex items-start gap-3'>
                  <Info className='w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5' />
                  <div className='text-sm'>
                    <p className='text-amber-400 font-medium mb-1'>
                      Can&apos;t find the code?
                    </p>
                    <p className='text-gray-400 text-sm sm:text-base'>Check your spam folder</p>
                  </div>
                </div>
              </div>

              <div className='flex gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleResendCode}
                  disabled={forgotPasswordMutation.isPending}
                  className='border-white/20 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl'
                >
                  {forgotPasswordMutation.isPending ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Send className='mr-2 w-4 h-4' />
                  )}
                  Resend Code
                </Button>
                <Button
                  type='submit'
                  disabled={resetPasswordMutation.isPending}
                  className='flex-1 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 font-bold rounded-xl'
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <CheckCircle className='ml-2 w-4 h-4' />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === 'email' && (
            <div className='mt-6 text-center'>
              <p className='text-gray-400 text-sm'>
                Remember your password?{' '}
                <Link
                  href='/login'
                  className='text-transparent bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text font-bold hover:from-violet-300 hover:to-pink-300 transition-all'
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
