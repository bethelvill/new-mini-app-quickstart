"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const ONBOARDING_KEY = "showstakr_onboarding_complete";

interface OnboardingStep {
  title: string;
  description: string;
  highlight?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to ShowStakr",
    description:
      "The prediction market on Base. Back your predictions with USDC and win from those who got it wrong.",
    highlight: "base",
  },
  {
    title: "Predict Outcomes",
    description:
      "Browse polls across sports, crypto, entertainment, and more. Find topics where your knowledge gives you an edge.",
  },
  {
    title: "Stake USDC",
    description:
      "Put your money where your mouth is. Stake as little as 0.1 USDC or go big if you're confident.",
  },
  {
    title: "Win & Withdraw",
    description:
      "Correct predictions win a share of the pool. Withdraw your winnings to your wallet anytime.",
  },
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[340px] bg-[#0A0A0A] border-[#1F1F1F] p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to ShowStakr</DialogTitle>
          <DialogDescription>Learn how to predict and win</DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-8 pb-6">
          {/* Step number */}
          <div className="text-[11px] text-[#9A9A9A]/60 font-medium tracking-widest uppercase mb-6">
            {currentStep + 1} of {steps.length}
          </div>

          {/* Title */}
          <h2 className="text-[22px] font-semibold text-[#EDEDED] leading-tight mb-3">
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className="text-[15px] text-[#9A9A9A] font-light leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Base badge - only on first step */}
          {currentStepData.highlight === "base" && (
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0000ff]/5 border border-[#0000ff]/10">
              <Image src="/base-text.svg" alt="Base" width={36} height={12} />
              <span className="text-xs text-[#9A9A9A]">Powered by Base</span>
            </div>
          )}
        </div>

        {/* Bottom section */}
        <div className="px-6 pb-6 pt-2">
          {/* Progress bar */}
          <div className="flex gap-1 mb-5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? "bg-[#EDEDED]" : "bg-[#1F1F1F]"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 ? (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 h-11 border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-full font-normal"
              >
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1 h-11 text-[#9A9A9A]/50 hover:text-[#9A9A9A] hover:bg-transparent font-normal"
              >
                Skip
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="flex-1 h-11 bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full"
            >
              {isLastStep ? "Get Started" : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
