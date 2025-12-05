"use client";
import { ReactNode } from "react";
import { base, baseSepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { CDPHooksProvider } from "@coinbase/cdp-hooks";
import "@coinbase/onchainkit/styles.css";

// Select chain based on environment variable (default to base mainnet)
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;
const chain = chainId === 84532 ? baseSepolia : base;

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <CDPHooksProvider
      config={{ projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID || "" }}
    >
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={chain}
        config={{
          appearance: {
            mode: "auto",
          },
          wallet: {
            display: "modal",
            preference: "all",
          },
        }}
        miniKit={{
          enabled: true,
          autoConnect: true,
          notificationProxyUrl: undefined,
        }}
      >
        {children}
      </OnchainKitProvider>
    </CDPHooksProvider>
  );
}
