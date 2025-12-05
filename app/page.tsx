"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAllPolls } from "@/lib/polls";
import type { Poll } from "@/types/api";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { data: pollsData } = useAllPolls();

  const polls: Poll[] = (pollsData?.data as any)?.docs || [];
  const activePolls = polls.filter((p) => p.status === "active").slice(0, 3);
  const totalPool = polls.reduce(
    (acc, p: any) => acc + (p.totalStakeAmount || 0),
    0
  );
  const totalPlayers = polls.reduce(
    (acc, p: any) => acc + (p.totalParticipants || 0),
    0
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Hero - Mobile First */}
      <section className="min-h-[100dvh] flex flex-col justify-center px-6 py-12 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 mb-6">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-medium text-violet-300">
              Live on Base
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[2.75rem] leading-[1.1] sm:text-6xl font-black mb-4">
            <span className="text-white">Predict.</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Stack wins.
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-gray-400 text-lg mb-8 max-w-sm">
            Back your predictions with USDC. Win from those who got it wrong.
          </p>

          {/* CTA */}
          <Link href="/polls" className="block">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white text-base font-bold rounded-2xl h-14 px-8 shadow-lg shadow-violet-500/25"
            >
              Start Predicting
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          {/* Stats Row */}
          {(totalPool > 0 || totalPlayers > 0) && (
            <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
              {totalPool > 0 && (
                <div>
                  <div className="text-2xl font-black text-white inline-flex items-center gap-1">
                    <Image src="/usdc.svg" alt="USDC" width={20} height={20} />
                    {totalPool.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Total Pool
                  </div>
                </div>
              )}
              {totalPlayers > 0 && (
                <div>
                  <div className="text-2xl font-black text-white">
                    {totalPlayers.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Players
                  </div>
                </div>
              )}
              {activePolls.length > 0 && (
                <div>
                  <div className="text-2xl font-black text-white">
                    {activePolls.length}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Live
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </section>

      {/* How it works - Cards */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-sm font-bold text-violet-400 uppercase tracking-widest mb-3">
            How it works
          </h2>
          <p className="text-2xl sm:text-3xl font-black text-white mb-10">
            Three steps. <span className="text-gray-500">That&apos;s it.</span>
          </p>

          <div className="space-y-4">
            {[
              {
                num: "01",
                title: "Connect",
                desc: "Link your wallet. Takes 2 seconds. Gas-free.",
              },
              {
                num: "02",
                title: "Predict",
                desc: "Pick an outcome. Stake USDC on your call.",
              },
              {
                num: "03",
                title: "Collect",
                desc: "Called it right? Losers' stakes are yours.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-violet-500/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <span className="text-xs font-mono text-violet-500/50 pt-1">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Predictions */}
      {activePolls.length > 0 && (
        <section className="px-6 py-20 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest">
                Live Now
              </h2>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mb-8">
              Active predictions
            </p>

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
                    className="group p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-violet-500/10 hover:border-violet-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                          {poll.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          {poll.totalStakeAmount > 0 && (
                            <span className="text-emerald-400 inline-flex items-center gap-1">
                              <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                              {poll.totalStakeAmount}
                            </span>
                          )}
                          {poll.totalParticipants > 0 && (
                            <span>{poll.totalParticipants} players</span>
                          )}
                          {timeLeft > 0 && (
                            <span>
                              {daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`}{" "}
                              left
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/polls" className="block mt-6">
              <Button
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl h-12"
              >
                View all predictions
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 mb-6 shadow-lg shadow-violet-500/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to play?
          </h2>
          <p className="text-gray-500 mb-8">
            Connect wallet. Pick winners. Stack USDC.
          </p>
          <Link href="/polls">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 text-base font-bold rounded-2xl h-14 px-10"
            >
              Let&apos;s go
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
