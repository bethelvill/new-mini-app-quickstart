"use client";

import { useWalletBalance } from "@/lib";
import { useAuthStore } from "@/stores/authStore";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { useMiniKit, useQuickAuth } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string;
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const { user, setUser, updateAdmin, updateSubAdmin, updateBalance } =
    useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Proactive token refresh - refreshes before JWT expires (1hr)
  useTokenRefresh();

  // Initialize the miniapp frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Authenticate via Farcaster Quick Auth
  const {
    data: authData,
  } = useQuickAuth<AuthResponse>("/api/auth", { method: "GET" });

  // Fetch wallet balance
  const { data: balanceData, isSuccess: balanceSuccess } = useWalletBalance(
    !!authData?.success
  );

  // Set up user data from Farcaster context
  useEffect(() => {
    if (authData?.success && context?.user) {
      // Create user object from Farcaster context
      const farcasterUser = {
        id: String(authData.user?.fid || context.user.fid),
        fid: authData.user?.fid || context.user.fid,
        username: context.user.username || `user_${context.user.fid}`,
        firstName: context.user.displayName?.split(" ")[0] || "Player",
        lastName: context.user.displayName?.split(" ").slice(1).join(" ") || "",
        email: "", // Not available from Farcaster
        roles: ["user"],
        isEmailVerified: true,
        isTwoFactorAuthEnabled: false,
        isPhoneVerified: false,
        kycCompleted: false,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        walletAddress: "",
        wallet: {
          balance: 0,
          bonusBalance: 0,
          isLocked: false,
          totalDeposits: 0,
          totalStakes: 0,
          totalWinnings: 0,
          totalWithdrawals: 0,
        },
      };

      setUser(farcasterUser);
      updateAdmin(false);
      updateSubAdmin(false);
      // setIsInitialized(true);
    }
  }, [authData, context, setUser, updateAdmin, updateSubAdmin]);

  // Update balance when wallet balance is fetched successfully
  useEffect(() => {
    if (balanceSuccess && balanceData?.data) {
      updateBalance(balanceData.data.totalBalance || 0);
    }
  }, [balanceData, balanceSuccess, updateBalance]);

  // Check auth state after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while initializing
  if (!isFrameReady || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#EDEDED] animate-spin mx-auto mb-3" />
          <p className="text-[#9A9A9A] text-sm font-light">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign in required state if no user after checking
  if (!user) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-[#151515] border border-[#1F1F1F] flex items-center justify-center mx-auto mb-5">
            <LogIn className="w-6 h-6 text-[#9A9A9A]" />
          </div>
          <h2 className="text-lg font-medium text-[#EDEDED] mb-2">
            Sign In Required
          </h2>
          <p className="text-[#9A9A9A] text-sm font-light mb-6">
            Sign in your wallet to access this page
          </p>
          <Link href="/">
            <Button className="bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full px-8">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
