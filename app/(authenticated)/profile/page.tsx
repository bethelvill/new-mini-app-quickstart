"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { capitalize } from "@/lib/capitalize";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/lib/notifications";
import { useMyStakes } from "@/lib/stakes";
import {
  useUpdateProfile,
  useUserProfile,
  useUserStatistics,
} from "@/lib/user";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Activity,
  Bell,
  CheckCircle,
  Crown,
  Edit3,
  Loader2,
  Mail,
  Save,
  Star,
  Trophy,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import numeral from "numeral";
import { useEffect, useState } from "react";
import { toast } from "sonner";

dayjs.extend(relativeTime);

export default function ProfilePage() {
  const router = useRouter();
  const { data: userResponse, isLoading } = useUserProfile();
  const user = userResponse?.data;
  const { data: userStatsResponse } = useUserStatistics();
  const userStats = userStatsResponse?.data;
  const { data: stakesData } = useMyStakes();
  const { data: notificationPrefsData } = useNotificationPreferences();
  const updateNotificationPrefs = useUpdateNotificationPreferences();
  const updateProfile = useUpdateProfile();

  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "activity">("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });

  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    push: true,
    sms: false,
    inApp: true,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (notificationPrefsData?.data?.channels) {
      setNotificationChannels(notificationPrefsData.data.channels);
    }
  }, [notificationPrefsData]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-violet-400" />
      </div>
    );
  }

  if (!user) return null;

  const avatarUrl =
    user.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.firstName + " " + user.lastName
    )}&background=7c3aed&color=fff&bold=true`;

  const memberSince = dayjs(user.createdAt).fromNow();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileForm, {
      onSuccess: () => {
        toast.success("Profile updated");
        setIsEditingProfile(false);
      },
      onError: (error: any) => toast.error(error?.message || "Update failed"),
    });
  };

  const handleChannelChange = (channel: string, value: boolean) => {
    setNotificationChannels((prev) => ({ ...prev, [channel]: value }));
    setHasUnsavedChanges(true);
  };

  const savePreferences = () => {
    updateNotificationPrefs.mutate(
      {
        channels: notificationChannels,
        types: {},
        quiet_hours: { enabled: false, start: "22:00", end: "08:00", timezone: "UTC" },
      },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          toast.success("Preferences saved");
        },
        onError: () => toast.error("Failed to save preferences"),
      }
    );
  };

  const getVerificationBadges = () => {
    const badges = [];
    if (user.isEmailVerified) {
      badges.push(
        <Badge key="email" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
          <Mail className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    if (user.kycCompleted) {
      badges.push(
        <Badge key="kyc" className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
          <UserCheck className="w-3 h-3 mr-1" />
          KYC
        </Badge>
      );
    }
    if (user.roles?.includes("admin")) {
      badges.push(
        <Badge key="admin" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">
          <Crown className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      );
    }
    return badges;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Profile</h1>
          <p className="text-gray-500 text-sm">Manage your account</p>
        </div>

        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={avatarUrl}
              alt={`${capitalize(user.firstName)} ${capitalize(user.lastName)}`}
              className="w-16 h-16 rounded-full border-2 border-white/20"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">
                {capitalize(user.firstName)} {capitalize(user.lastName)}
              </h2>
              <p className="text-gray-400 text-sm truncate">@{user.username}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {getVerificationBadges()}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-gray-500">Member</p>
              <p className="text-sm font-bold text-white">{memberSince}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Win Rate</p>
              <p className="text-sm font-bold text-emerald-400">
                {userStats?.winRate ? `${userStats.winRate.toFixed(0)}%` : "0%"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Staked</p>
              <p className="text-sm font-bold text-violet-400">
                ${numeral(userStats?.totalStaked || 0).format("0,0")}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { value: "profile", label: "Profile", icon: User },
            { value: "preferences", label: "Notifications", icon: Bell },
            { value: "activity", label: "Activity", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-gray-500 hover:text-white bg-white/[0.03]"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="font-bold text-white">Personal Info</h3>
              {!isEditingProfile ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingProfile(true)}
                  className="h-8 border-white/10 text-gray-400 hover:text-white rounded-lg"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({
                      firstName: user.firstName || "",
                      lastName: user.lastName || "",
                      username: user.username || "",
                    });
                  }}
                  className="h-8 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <form onSubmit={handleProfileSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-400">First Name</Label>
                  <Input
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    disabled={!isEditingProfile}
                    className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-400">Last Name</Label>
                  <Input
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    disabled={!isEditingProfile}
                    className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                  <Input
                    value={profileForm.username}
                    disabled
                    className="h-10 pl-7 bg-white/[0.03] border-white/[0.06] text-white rounded-xl opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Email</Label>
                <Input
                  value={user.email}
                  disabled
                  className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl opacity-50"
                />
              </div>

              {isEditingProfile && (
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="w-full h-11 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </form>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="p-4 border-b border-white/[0.06]">
              <h3 className="font-bold text-white">Notification Channels</h3>
              <p className="text-xs text-gray-500 mt-1">Choose how to receive updates</p>
            </div>

            <div className="p-4 space-y-3">
              {[
                { key: "email", label: "Email", desc: "Get notified via email", icon: Mail, enabled: true },
                { key: "push", label: "Push", desc: "Browser notifications", icon: Bell, enabled: true },
                { key: "inApp", label: "In-App", desc: "Notifications in app", icon: Activity, enabled: true },
                { key: "sms", label: "SMS", desc: "Coming soon", icon: Mail, enabled: false },
              ].map((channel) => (
                <div
                  key={channel.key}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]",
                    !channel.enabled && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <channel.icon className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{channel.label}</p>
                      <p className="text-xs text-gray-500">{channel.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationChannels[channel.key as keyof typeof notificationChannels]}
                    onCheckedChange={(checked) => handleChannelChange(channel.key, checked)}
                    disabled={!channel.enabled}
                    className="data-[state=checked]:bg-violet-500"
                  />
                </div>
              ))}

              {hasUnsavedChanges && (
                <Button
                  onClick={savePreferences}
                  disabled={updateNotificationPrefs.isPending}
                  className="w-full h-11 mt-4 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl"
                >
                  {updateNotificationPrefs.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
                <Trophy className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{userStats?.totalStaked || 0}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{userStats?.wonStakes || 0}</p>
                <p className="text-xs text-gray-500">Won</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{userStats?.activeStakes || 0}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>

            {/* Recent Stakes */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
              <div className="p-4 border-b border-white/[0.06]">
                <h3 className="font-bold text-white">Recent Activity</h3>
              </div>

              <div className="p-4">
                {stakesData?.data?.docs?.length > 0 ? (
                  <div className="space-y-2">
                    {stakesData.data.docs.slice(0, 5).map((stake: any) => (
                      <div
                        key={stake.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              stake.status === "won"
                                ? "bg-emerald-500/20"
                                : stake.status === "lost"
                                ? "bg-red-500/20"
                                : "bg-gray-500/20"
                            )}
                          >
                            <Trophy
                              className={cn(
                                "w-4 h-4",
                                stake.status === "won"
                                  ? "text-emerald-400"
                                  : stake.status === "lost"
                                  ? "text-red-400"
                                  : "text-gray-400"
                              )}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate max-w-[180px]">
                              {stake.poll?.title || "Prediction"}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${stake.amount} • {dayjs(stake.createdAt).fromNow()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "capitalize text-xs",
                            stake.status === "won"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : stake.status === "lost"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                          )}
                        >
                          {stake.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No activity yet</p>
                    <p className="text-gray-500 text-xs mt-1">Make a prediction to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
