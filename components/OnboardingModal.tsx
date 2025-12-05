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
import { TrendingUp, Wallet, Trophy, ChevronRight, ChevronLeft } from "lucide-react";

const ONBOARDING_KEY = "showstakr_onboarding_complete";

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <TrendingUp className="w-12 h-12 text-violet-400" />,
    title: "Predict Outcomes",
    description:
      "Browse entertainment polls and predict who gets evicted, wins challenges, or comes out on top. Your knowledge of reality TV pays off!",
  },
  {
    icon: <Wallet className="w-12 h-12 text-violet-400" />,
    title: "Stake USDC",
    description:
      "Back your predictions with USDC. The more confident you are, the more you can stake. All transactions are gas-free!",
  },
  {
    icon: <Trophy className="w-12 h-12 text-violet-400" />,
    title: "Win Rewards",
    description:
      "When your prediction is correct, you win a share of the pool based on your stake. Withdraw your winnings anytime!",
  },
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      // Small delay to let the app load first
      const timer = setTimeout(() => setIsOpen(true), 500);
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
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to ShowStakr</DialogTitle>
          <DialogDescription>
            Learn how to predict and win
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center text-center py-4">
          {/* Step indicator */}
          <div className="flex gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-violet-500"
                    : index < currentStep
                    ? "bg-violet-500/50"
                    : "bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="mb-4 p-4 rounded-full bg-violet-500/10">
            {currentStepData.icon}
          </div>

          {/* Content */}
          <h2 className="text-xl font-bold text-white mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            {currentStepData.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div>
            {currentStep > 0 ? (
              <Button
                variant="ghost"
                onClick={handlePrevious}
                className="text-gray-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-300"
              >
                Skip
              </Button>
            )}
          </div>

          <Button
            onClick={handleNext}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isLastStep ? (
              "Get Started"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
