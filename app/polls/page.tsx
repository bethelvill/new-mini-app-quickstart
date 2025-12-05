"use client";

import Image from "next/image";
import InsufficientBalanceModal from "@/components/modals/InsufficientBalanceModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POLL_CATEGORIES } from "@/constants/categories";
import { usePlatformLimits } from "@/lib/platform-settings";
import { getStatusBadge, getCategoryBadge } from "@/lib/poll-badges";
import {
  useAllPolls,
  useCancelPoll,
  useClosePoll,
  useDeletePoll,
  usePollStats,
  useResolvePoll,
} from "@/lib/polls";
import { useCalculateWinnings, useCreateStake } from "@/lib/stakes";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Poll, PollOption } from "@/types/api";
import {
  ChevronRight,
  Coins,
  Eye,
  Filter,
  Loader2,
  Plus,
  Search,
  Settings,
  Timer,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import numeral from "numeral";
import { useState } from "react";
import { toast } from "sonner";

export default function PollsPage() {
  const router = useRouter();
  const { user, updateBalance, balance, isAdmin, isSubAdmin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 9;

  const apiParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, refetch } = useAllPolls(apiParams);
  const { data: limitsData } = usePlatformLimits();
  const platformLimits = limitsData?.data;
  const minStake = platformLimits?.minStakeAmount || 100;
  const maxStake = platformLimits?.maxStakeAmount || 10000;
  const closePollMutation = useClosePoll();
  const resolvePollMutation = useResolvePoll();
  const cancelPollMutation = useCancelPoll();
  const deletePollMutation = useDeletePoll();

  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<PollOption | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);
  const [viewOptionsDialogOpen, setViewOptionsDialogOpen] = useState(false);
  const [insufficientBalanceOpen, setInsufficientBalanceOpen] = useState(false);
  const [requiredStakeAmount, setRequiredStakeAmount] = useState(0);
  const createStakeMutation = useCreateStake();
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminAction, setAdminAction] = useState<
    "close" | "resolve" | "cancel" | "delete"
  >("resolve");
  const [selectedWinnerId, setSelectedWinnerId] = useState("");

  const { data: selectedPollStats } = usePollStats(selectedPoll?.id || "");
  const { data: winningsData } = useCalculateWinnings({
    pollId: selectedPoll?.id || "",
    selectedOptionId: selectedOption?.id || "",
    amount: parseInt(stakeAmount) || 0,
  });

  const responseData = data?.data as any;
  const polls: Poll[] = responseData?.docs || [];
  const totalPages = responseData?.totalPages || 1;
  const hasNextPage = responseData?.hasNextPage || false;
  const hasPrevPage = responseData?.hasPrevPage || false;
  const totalDocs = responseData?.totalDocs || 0;

  const allCategories = [
    { value: "all", label: "All Categories" },
    ...POLL_CATEGORIES,
  ];

  const hasUserStaked = (poll: Poll) => {
    if (!user || !poll.statistics?.stakerUserIds) return false;
    return poll.statistics.stakerUserIds.includes(user.id);
  };

  const handleStakeClick = (poll: Poll, option?: PollOption) => {
    if (poll.status !== "active") {
      toast.error("This poll is closed for staking");
      return;
    }
    if (!user) {
      toast.error("Please sign in to place a stake");
      router.push("/");
      return;
    }
    if (hasUserStaked(poll)) {
      toast.error("You already staked on this poll");
      return;
    }
    setSelectedPoll(poll);
    setSelectedOption(option || null);
    setIsStakeDialogOpen(true);
  };

  const handlePlaceStake = () => {
    if (!selectedPoll || !selectedOption || !stakeAmount) return;

    const timeLeft =
      new Date(selectedPoll?.endTime ?? 0).getTime() - Date.now();
    if (timeLeft <= 0) {
      toast.error("This poll has ended");
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (amount < minStake) {
      toast.error(`Minimum stake is ${minStake} USDC`);
      return;
    }
    if (amount > maxStake) {
      toast.error(`Maximum stake is ${maxStake.toLocaleString()} USDC`);
      return;
    }
    if (amount > balance) {
      setRequiredStakeAmount(amount);
      setInsufficientBalanceOpen(true);
      setIsStakeDialogOpen(false);
      return;
    }

    createStakeMutation.mutate(
      {
        pollId: selectedPoll.id,
        selectedOptionId: selectedOption.id!,
        amount,
      },
      {
        onSuccess: () => {
          updateBalance(balance - amount);
          toast.success(`Staked ${amount} USDC on ${selectedOption.text}`);
          setIsStakeDialogOpen(false);
          setStakeAmount("");
          setSelectedOption(null);
          setSelectedPoll(null);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to place stake");
        },
      }
    );
  };

  const handleAdminAction = () => {
    if (!selectedPoll) return;

    if (adminAction === "close") {
      closePollMutation.mutate(selectedPoll.id, {
        onSuccess: () => {
          toast.success("Poll closed");
          setIsAdminDialogOpen(false);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to close poll");
        },
      });
    } else if (adminAction === "resolve") {
      if (!selectedWinnerId) {
        toast.error("Please select a winner");
        return;
      }

      if (selectedPoll.status === "active") {
        closePollMutation.mutate(selectedPoll.id, {
          onSuccess: () => {
            resolvePollMutation.mutate(
              { id: selectedPoll.id, data: { correctOptionId: selectedWinnerId } },
              {
                onSuccess: () => {
                  toast.success("Poll resolved");
                  setIsAdminDialogOpen(false);
                  setSelectedWinnerId("");
                  refetch();
                },
                onError: (error: any) => {
                  toast.error(error?.response?.data?.message || "Failed to resolve");
                },
              }
            );
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to close poll");
          },
        });
      } else {
        resolvePollMutation.mutate(
          { id: selectedPoll.id, data: { correctOptionId: selectedWinnerId } },
          {
            onSuccess: () => {
              toast.success("Poll resolved");
              setIsAdminDialogOpen(false);
              setSelectedWinnerId("");
              refetch();
            },
            onError: (error: any) => {
              toast.error(error?.response?.data?.message || "Failed to resolve");
            },
          }
        );
      }
    } else if (adminAction === "cancel") {
      cancelPollMutation.mutate(selectedPoll.id, {
        onSuccess: () => {
          toast.success("Poll cancelled, stakes refunded");
          setIsAdminDialogOpen(false);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to cancel");
        },
      });
    } else if (adminAction === "delete") {
      deletePollMutation.mutate(selectedPoll.id, {
        onSuccess: () => {
          toast.success("Poll deleted");
          setIsAdminDialogOpen(false);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to delete");
        },
      });
    }
  };

  const quickAmounts = [0.01, 0.05, 0.1, 0.5];

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Predictions</h1>
            <p className="text-gray-500 text-sm">Pick winners, stack wins</p>
          </div>
          {user && (isAdmin || isSubAdmin) && (
            <Link href="/admin/create">
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl h-10 px-4"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
            </Link>
          )}
        </div>

        {/* Search & Filter Toggle */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-11 bg-white/[0.03] border-white/[0.06] text-white placeholder-gray-500 rounded-xl"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-11 px-3 rounded-xl border-white/[0.06]",
              showFilters ? "bg-violet-500/20 border-violet-500/30 text-violet-400" : "text-gray-400"
            )}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Filters</span>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setSortBy("createdAt");
                  setCurrentPage(1);
                }}
                className="text-xs text-gray-500 hover:text-violet-400"
              >
                Reset
              </button>
            </div>

            <Select
              value={selectedCategory}
              onValueChange={(v) => { setSelectedCategory(v); setCurrentPage(1); }}
            >
              <SelectTrigger className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                {allCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-white/10">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedStatus}
              onValueChange={(v) => { setSelectedStatus(v); setCurrentPage(1); }}
            >
              <SelectTrigger className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="all" className="text-white hover:bg-white/10">All Status</SelectItem>
                <SelectItem value="active" className="text-white hover:bg-white/10">Active</SelectItem>
                <SelectItem value="closed" className="text-white hover:bg-white/10">Closed</SelectItem>
                <SelectItem value="resolved" className="text-white hover:bg-white/10">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select
                value={sortBy}
                onValueChange={(v) => { setSortBy(v); setCurrentPage(1); }}
              >
                <SelectTrigger className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl flex-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  <SelectItem value="createdAt" className="text-white hover:bg-white/10">Latest</SelectItem>
                  <SelectItem value="endTime" className="text-white hover:bg-white/10">Ending Soon</SelectItem>
                  <SelectItem value="totalStakeAmount" className="text-white hover:bg-white/10">Pool Size</SelectItem>
                  <SelectItem value="totalParticipants" className="text-white hover:bg-white/10">Popular</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => { setSortOrder(sortOrder === "asc" ? "desc" : "asc"); setCurrentPage(1); }}
                className="h-10 px-3 border-white/[0.06] text-gray-400 rounded-xl"
              >
                {sortOrder === "desc" ? "↓" : "↑"}
              </Button>
            </div>
          </div>
        )}

        {/* Polls List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No polls found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {polls.map((poll: any) => {
              const timeLeft = new Date(poll.endTime).getTime() - Date.now();
              const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
              const daysLeft = Math.floor(hoursLeft / 24);
              const isExpired = timeLeft <= 0;
              const userStaked = hasUserStaked(poll);

              return (
                <div
                  key={poll.id}
                  onClick={() => router.push(`/polls/${poll.id}`)}
                  className="group p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-violet-500/10 hover:border-violet-500/20 transition-all cursor-pointer"
                >
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getStatusBadge(poll.status)}
                    {getCategoryBadge(poll.category)}
                    {userStaked && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                        Staked
                      </Badge>
                    )}
                    {poll.status === "active" && timeLeft > 0 && (
                      <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs ml-auto">
                        <Timer className="w-3 h-3 mr-1" />
                        {daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors">
                    {poll.title}
                  </h3>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    {poll.totalStakeAmount > 0 && (
                      <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                        <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                        {numeral(poll.totalStakeAmount).format("0,0.00")}
                      </span>
                    )}
                    <span>{poll.totalParticipants || 0} players</span>
                    <span>{poll.options.length} options</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {poll.status === "active" && !isExpired && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!userStaked) handleStakeClick(poll);
                        }}
                        disabled={userStaked}
                        className={cn(
                          "flex-1 h-9 rounded-xl font-medium text-sm",
                          userStaked
                            ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                        )}
                      >
                        {userStaked ? "Staked" : "Stake"}
                        <Coins className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPoll(poll);
                        setViewOptionsDialogOpen(true);
                      }}
                      className="h-9 px-3 rounded-xl border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    {(isAdmin || isSubAdmin) && (poll.status === "active" || poll.status === "closed") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPoll(poll);
                          setIsAdminDialogOpen(true);
                        }}
                        className="h-9 px-3 rounded-xl border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalDocs={totalDocs}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={setCurrentPage}
            itemName="polls"
            className="mt-6"
          />
        )}
      </div>

      {/* Stake Dialog */}
      <Dialog
        open={isStakeDialogOpen}
        onOpenChange={(open) => {
          setIsStakeDialogOpen(open);
          if (!open) {
            setSelectedOption(null);
            setStakeAmount("");
            setSelectedPoll(null);
          }
        }}
      >
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Place Stake</DialogTitle>
            <DialogDescription className="text-gray-400 line-clamp-2">
              {selectedPoll?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Select prediction</Label>
              <Select
                value={selectedOption?.id || ""}
                onValueChange={(value) => {
                  const option = selectedPoll?.options.find((opt: any) => opt.id === value);
                  setSelectedOption(option || null);
                }}
              >
                <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl">
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 max-h-[240px]">
                  {selectedPoll?.options.map((option: any) => {
                    const optionStats = selectedPollStats?.data?.optionStats?.find(
                      (s: any) => s.optionId === option.id
                    );
                    const percentage = optionStats
                      ? ((optionStats.stakes / (selectedPollStats?.data?.totalStakes || 1)) * 100).toFixed(1)
                      : "0.0";

                    return (
                      <SelectItem key={option.id} value={option.id} className="text-white hover:bg-white/10">
                        <div className="flex items-center justify-between w-full">
                          <span>{option.text}</span>
                          {optionStats && optionStats.stakes > 0 && (
                            <span className="text-xs text-gray-400 ml-2">
                              {percentage}% • {optionStats.odds.toFixed(2)}x
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedOption && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Amount (USDC)</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Enter amount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min={minStake}
                    className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                  />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => setStakeAmount(amount.toString())}
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-white/10 text-white hover:bg-white/10 text-xs h-8"
                      >
                        {numeral(amount).format("0,0.00")}
                      </Button>
                    ))}
                  </div>
                </div>

                {winningsData?.data && parseFloat(stakeAmount) >= minStake && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Share</span>
                      <span className="text-white font-bold">
                        {winningsData.data.userSharePercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Potential Win</span>
                      <span className="text-emerald-400 font-bold">
                        {winningsData.data.grossWinnings.toLocaleString()} USDC
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Balance</span>
                    <span className="text-white font-medium">{balance.toLocaleString()} USDC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">After</span>
                    <span className={cn(
                      "font-medium",
                      parseFloat(stakeAmount) > balance ? "text-red-400" : "text-emerald-400"
                    )}>
                      {(balance - parseFloat(stakeAmount || "0")).toLocaleString()} USDC
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceStake}
                  disabled={createStakeMutation.isPending || !stakeAmount}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold"
                >
                  {createStakeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing...
                    </>
                  ) : (
                    "Confirm Stake"
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Options Dialog */}
      <Dialog
        open={viewOptionsDialogOpen}
        onOpenChange={(open) => {
          setViewOptionsDialogOpen(open);
          if (!open) setSelectedPoll(null);
        }}
      >
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Options</DialogTitle>
            <DialogDescription className="text-gray-400 line-clamp-2">
              {selectedPoll?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 max-h-[50vh] overflow-y-auto space-y-2">
            {selectedPoll?.options.map((option: any, index: number) => {
              const statisticsOption = selectedPoll?.statistics?.options?.find(
                (o: any) => o.id === option.id
              );
              const optionStakeAmount =
                statisticsOption?.stakeAmount || selectedPoll?.stakesPerOption?.[option.id] || 0;
              const totalStakeAmount = selectedPoll?.totalStakeAmount || 0;
              const percentage =
                statisticsOption?.percentage !== undefined
                  ? statisticsOption.percentage
                  : totalStakeAmount > 0
                  ? (optionStakeAmount / totalStakeAmount) * 100
                  : 0;
              const isWinner =
                selectedPoll.status === "resolved" &&
                (selectedPoll.winningOptionId === option.id || selectedPoll.correctOptionId === option.id);

              return (
                <div
                  key={option.id}
                  className={cn(
                    "p-3 rounded-xl border",
                    isWinner ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/[0.03] border-white/[0.06]"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white text-sm flex items-center gap-2">
                      <span className="text-gray-500">#{index + 1}</span>
                      {option.text}
                      {isWinner && (
                        <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        isWinner
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-violet-500/20 text-violet-400"
                      )}
                    >
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        background: isWinner
                          ? "linear-gradient(to right, #10b981, #14b8a6)"
                          : "linear-gradient(to right, #8b5cf6, #6366f1)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-400">Pool</p>
                <p className="text-sm font-bold text-emerald-400 inline-flex items-center justify-center gap-1">
                  <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                  {numeral(selectedPoll?.totalStakeAmount || 0).format("0,0.00")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Players</p>
                <p className="text-sm font-bold text-white">{selectedPoll?.totalParticipants || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Options</p>
                <p className="text-sm font-bold text-violet-400">{selectedPoll?.options.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {selectedPoll?.status === "active" && (
              <Button
                onClick={() => {
                  setViewOptionsDialogOpen(false);
                  if (!hasUserStaked(selectedPoll)) handleStakeClick(selectedPoll);
                }}
                disabled={hasUserStaked(selectedPoll)}
                className={cn(
                  "flex-1 h-11 rounded-xl font-bold",
                  hasUserStaked(selectedPoll)
                    ? "bg-gray-600/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                )}
              >
                <Coins className="w-4 h-4 mr-2" />
                {hasUserStaked(selectedPoll) ? "Staked" : "Stake"}
              </Button>
            )}
            <Button
              onClick={() => router.push(`/polls/${selectedPoll?.id}`)}
              variant="outline"
              className="flex-1 h-11 rounded-xl border-white/10 text-white hover:bg-white/10"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Dialog */}
      {(isAdmin || isSubAdmin) && (
        <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Manage Poll</DialogTitle>
              <DialogDescription className="text-gray-400 line-clamp-2">
                {selectedPoll?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-sm">Action</Label>
                <Select value={adminAction} onValueChange={(value: any) => setAdminAction(value)}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {selectedPoll?.status === "active" && (
                      <SelectItem value="close" className="text-white hover:bg-white/10">
                        Close Poll
                      </SelectItem>
                    )}
                    {isAdmin && (
                      <SelectItem value="resolve" className="text-white hover:bg-white/10">
                        {selectedPoll?.status === "active" ? "Close & Select Winner" : "Select Winner"}
                      </SelectItem>
                    )}
                    <SelectItem value="cancel" className="text-white hover:bg-white/10">
                      Cancel (Refund)
                    </SelectItem>
                    {isAdmin && (
                      <SelectItem value="delete" className="text-white hover:bg-white/10">
                        Delete Poll
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {adminAction === "resolve" && isAdmin && (
                <div className="space-y-2">
                  <Label className="text-sm">Winner</Label>
                  <Select value={selectedWinnerId} onValueChange={setSelectedWinnerId}>
                    <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl">
                      <SelectValue placeholder="Choose winning option" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      {selectedPoll?.options.map((option) => (
                        <SelectItem key={option.id} value={option.id || ""} className="text-white hover:bg-white/10">
                          {option.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {adminAction === "close" && (
                <p className="text-amber-400 text-sm">Closes poll and prevents new stakes.</p>
              )}
              {adminAction === "cancel" && (
                <p className="text-amber-400 text-sm">Cancels poll and refunds all stakes.</p>
              )}
              {adminAction === "delete" && (
                <p className="text-red-400 text-sm">Permanently deletes the poll.</p>
              )}

              <Button
                onClick={handleAdminAction}
                disabled={
                  closePollMutation.isPending ||
                  resolvePollMutation.isPending ||
                  cancelPollMutation.isPending ||
                  deletePollMutation.isPending ||
                  (adminAction === "resolve" && !selectedWinnerId)
                }
                className="w-full h-11 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 font-bold"
              >
                {closePollMutation.isPending ||
                resolvePollMutation.isPending ||
                cancelPollMutation.isPending ||
                deletePollMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={insufficientBalanceOpen}
        onClose={() => {
          setInsufficientBalanceOpen(false);
          setRequiredStakeAmount(0);
        }}
        requiredAmount={requiredStakeAmount}
        currentBalance={balance}
      />
    </div>
  );
}
