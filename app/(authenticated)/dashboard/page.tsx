"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAllPolls } from "@/lib/polls";
import { useMyStakes } from "@/lib/stakes";
import { useUserStatistics } from "@/lib/user";
import { useAuthStore } from "@/stores/authStore";
import type { Poll } from "@/types/api";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Trophy,
  Target,
  TrendingUp,
  Wallet,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, balance } = useAuthStore();
  const { data: pollsData, isLoading } = useAllPolls();
  const { data: userStatsResponse } = useUserStatistics();
  const { data: stakesData } = useMyStakes();
  const router = useRouter();

  const userStats = userStatsResponse?.data;
  const stakes = stakesData?.data?.docs || [];
  const polls: Poll[] = (pollsData?.data as any)?.docs || [];
  const activePolls = polls.filter((p) => p.status === "active").slice(0, 3);

  // Recent activity from stakes
  const recentActivity = stakes.slice(0, 4).map((stake: any) => {
    const isWin = stake.status === "won";
    const isLoss = stake.status === "lost";
    const isRefund = stake.status === "refunded";

    return {
      id: stake.id,
      title: stake.poll?.title || "Prediction",
      amount: isWin
        ? stake.winningsAmount || 0
        : isRefund
        ? stake.amount
        : stake.amount,
      isPositive: isWin || isRefund,
      status: stake.status,
    };
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm mb-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </p>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
        </div>

        {/* Balance Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 mb-6">
          <p className="text-sm text-gray-400 mb-1">Your Balance</p>
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2">
              <Image src="/usdc.svg" alt="USDC" width={28} height={28} />
              <span className="text-3xl font-black text-white">
                {balance.toLocaleString()}
              </span>
            </div>
            <Link href="/wallet">
              <Button
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-9 px-4"
              >
                <Wallet className="w-4 h-4 mr-1.5" />
                Manage
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-xs text-gray-500 mb-1">Win Rate</p>
            <p className="text-lg font-bold text-white">
              {userStats?.winRate ? `${userStats.winRate.toFixed(0)}%` : "0%"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-xs text-gray-500 mb-1">Total Won</p>
            <p className="text-lg font-bold text-emerald-400 inline-flex items-center gap-1">
              <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
              {userStats?.totalWon?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-xs text-gray-500 mb-1">Stakes</p>
            <p className="text-lg font-bold text-white">
              {userStats?.completedStakes || 0}
            </p>
          </div>
        </div>

        {/* Active Predictions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Live Predictions</h2>
            <Link
              href="/polls"
              className="text-sm text-gray-500 hover:text-violet-400 flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activePolls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">
                No active predictions right now
              </p>
              <Link href="/polls">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-gray-400"
                >
                  Browse All
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activePolls.map((poll) => {
                const timeLeft =
                  new Date(poll.endTime ?? 0).getTime() - Date.now();
                const hoursLeft = Math.max(
                  0,
                  Math.floor(timeLeft / (1000 * 60 * 60))
                );
                const daysLeft = Math.floor(hoursLeft / 24);

                return (
                  <div
                    key={poll.id}
                    onClick={() => router.push(`/polls/${poll.id}`)}
                    className="group p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-violet-500/10 hover:border-violet-500/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate text-sm group-hover:text-violet-300 transition-colors">
                          {poll.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                          {poll.totalStakeAmount > 0 && (
                            <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                              <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                              {poll.totalStakeAmount}
                            </span>
                          )}
                          {poll.totalParticipants > 0 && (
                            <span>{poll.totalParticipants} players</span>
                          )}
                          {timeLeft > 0 && (
                            <span>
                              {daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <Target className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-1">No activity yet</p>
              <p className="text-gray-600 text-xs">
                Make your first prediction
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity, i) => (
                <div
                  key={activity.id || i}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.status === "won"
                          ? "bg-emerald-500/20"
                          : activity.status === "lost"
                          ? "bg-red-500/20"
                          : activity.status === "refunded"
                          ? "bg-blue-500/20"
                          : "bg-violet-500/20"
                      }`}
                    >
                      {activity.status === "won" ? (
                        <Trophy className="w-4 h-4 text-emerald-400" />
                      ) : activity.status === "lost" ? (
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                      ) : activity.status === "refunded" ? (
                        <RefreshCw className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Target className="w-4 h-4 text-violet-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium truncate max-w-[180px]">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {activity.status}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold inline-flex items-center gap-1 ${
                      activity.isPositive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {activity.isPositive ? "+" : "-"}
                    <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                    {activity.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <Link href="/polls" className="block">
          <Button className="w-full h-14 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-bold rounded-2xl">
            <TrendingUp className="w-5 h-5 mr-2" />
            Make a Prediction
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
