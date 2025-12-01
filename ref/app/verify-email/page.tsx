'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useVerifyEmail, useResendVerifyEmail } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  MailCheck,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  Mail,
  Shield,
  Sparkles,
  Clock,
  AlertCircle,
  PartyPopper,
} from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState('');
  const [resent, setResent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const verifyEmailMutation = useVerifyEmail();
  const resendMutation = useResendVerifyEmail();

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    verifyEmailMutation.mutate(
      { email: email.toLowerCase(), otp },
      {
        onSuccess: () => {
          toast.success('Account verified successfully! You can now login 🔥');
          router.push('/login');
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Invalid code. Try again!', { duration: 3000 });
        },
      }
    );
  };

  const handleResend = () => {
    resendMutation.mutate(
      { email: email.toLowerCase() },
      {
        onSuccess: () => {
          setResent(true);
          setResendCooldown(60); // 60 second cooldown
          toast.success('Fresh code sent! Check your inbox 📬');
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Could not resend code. Try again!');
        },
      }
    );
  };

  return (
    <div className='min-h-screen bg-black flex items-center justify-center p-3 sm:p-4 relative overflow-hidden'>
      {/* Animated Background */}
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-violet-950/30 via-black to-pink-950/30' />
        <div className='absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000' />
      </div>

      <div className='relative z-10 w-full max-w-sm sm:max-w-md px-2 sm:px-0'>
        {/* Back Link */}
        <Link
          href='/login'
          className='inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 sm:mb-8 text-sm sm:text-base'
        >
          <ArrowLeft className='w-4 h-4' />
          <span>Back to login</span>
        </Link>

        <div className='text-center mb-6 sm:mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 to-violet-500 mb-3 sm:mb-4 shadow-2xl shadow-emerald-500/25'>
            <MailCheck className='w-8 h-8 sm:w-10 sm:h-10 text-white' />
          </div>
          <h1 className='text-2xl sm:text-3xl font-black mb-2'>
            <span className='bg-gradient-to-r from-emerald-400 via-violet-400 to-pink-400 bg-clip-text text-transparent'>
              Verify Your Email
            </span>
          </h1>
          <p className='text-gray-400 text-sm sm:text-base'>
            One last step to join the winning squad!
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl'>
          <form onSubmit={handleVerify} className='space-y-4 sm:space-y-6'>
            {/* Email Display */}
            <div className='p-3 sm:p-4 rounded-xl bg-violet-500/10 border border-violet-500/30'>
              <div className='flex items-center gap-3'>
                <Mail className='w-5 h-5 text-violet-400 flex-shrink-0' />
                <div className='flex-1 min-w-0'>
                  <p className='text-xs text-gray-400 mb-0.5 sm:mb-1'>
                    Verification code sent to:
                  </p>
                  <p className='text-sm font-medium text-white truncate'>
                    {email}
                  </p>
                </div>
              </div>
            </div>

            {/* OTP Input */}
            <div className='space-y-2'>
              <Label className='text-gray-300 font-medium text-sm sm:text-base'>
                Enter 6-digit code
              </Label>
              <Input
                type='text'
                placeholder='000000'
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) setOtp(value);
                }}
                className='h-12 sm:h-14 text-center text-xl sm:text-2xl font-mono tracking-[0.3em] sm:tracking-[0.5em] bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-emerald-500/50 focus:bg-white/10 transition-all'
                maxLength={6}
                autoComplete='one-time-code'
                autoFocus
              />
              {otp.length > 0 && otp.length < 6 && (
                <p className='text-amber-400 text-sm flex items-center gap-1'>
                  <AlertCircle className='w-3 h-3' />
                  Enter all 6 digits
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className='p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10'>
              <div className='flex items-start gap-3 text-sm'>
                <Shield className='w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5' />
                <div className='space-y-1'>
                  <p className='text-gray-300 font-medium'>
                    Didn&apos;t get the code?
                  </p>
                  <p className='text-gray-500 text-xs'>
                    Check your spam folder or click resend below
                  </p>
                </div>
              </div>
            </div>

            <Button
              type='submit'
              disabled={verifyEmailMutation.isPending || otp.length !== 6}
              className='w-full h-10 sm:h-12 bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-emerald-500/25 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {verifyEmailMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Join
                  <PartyPopper className='ml-2 w-5 h-5' />
                </>
              )}
            </Button>
          </form>

          <div className='mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={handleResend}
              disabled={resendMutation.isPending || resendCooldown > 0}
              className='w-full h-12 rounded-xl border-white/20 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50'
            >
              {resendMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className='mr-2 h-4 w-4' />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          <div className='mt-4 pt-4 border-t border-white/10'>
            <p className='text-center text-xs text-gray-500'>
              Having trouble? Contact support@showstakr.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
