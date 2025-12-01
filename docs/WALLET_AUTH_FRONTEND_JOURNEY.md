# Wallet Authentication Frontend Journey

A chronological documentation of implementing SIWE (Sign-In with Ethereum) authentication with support for both EOA and Smart Wallets.

---

## The Starting Point

We had a Next.js app using OnchainKit for wallet connections, but no proper authentication flow. Users could connect wallets but couldn't sign in.

---

## Step 1: Remove Hard Page Refresh on 401

**Problem:** The app was doing a hard page refresh on 401 errors, causing poor UX.

**Solution:** Changed `lib/api.ts` to just clear auth state without redirecting:

```typescript
// Before
if (error.response?.status === 401) {
  window.location.href = "/"; // Hard refresh - BAD
}

// After
export const handleUnauthorized = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("auth-store");
    localStorage.removeItem("user");
    toast.error("Session expired. Please login again.");
  }
};
```

---

## Step 2: Dynamic Chain Configuration

**Problem:** Chain ID was hardcoded. Needed to switch between Base mainnet (8453) and Base Sepolia (84532) based on environment.

**Solution:** Updated `app/rootProvider.tsx`:

```typescript
import { base, baseSepolia } from "wagmi/chains";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;
const chain = chainId === 84532 ? baseSepolia : base;

<OnchainKitProvider chain={chain} ... />
```

---

## Step 3: Wrong Network Detection

**Problem:** Users on wrong network couldn't sign in, but got confusing errors.

**Solution:** Added network detection and switch button in `hooks/use-wallet-auth.ts`:

```typescript
const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();

const isWrongNetwork = isConnected && chainId !== EXPECTED_CHAIN_ID;

const switchToCorrectNetwork = useCallback(async () => {
  try {
    await switchChain({ chainId: EXPECTED_CHAIN_ID });
    toast.success("Switched to correct network");
  } catch (err) {
    toast.error("Failed to switch network. Please switch manually.");
  }
}, [switchChain]);
```

Added UI in Navbar:
```tsx
{isWrongNetwork && (
  <button onClick={switchToCorrectNetwork}>
    Switch Network
  </button>
)}
```

---

## Step 4: Fix Loading State Gap

**Problem:** After wallet connect, there was a blank state while profile was loading.

**Solution:** Added loading placeholder:

```tsx
{isWalletConnected && !user && !isWrongNetwork && !showSignIn && (
  <div className="w-9 h-9 rounded-xl bg-white/10 animate-pulse" />
)}
```

---

## Step 5: First SIWE Attempt (Frontend Message Generation)

**Problem:** Needed to implement Sign-In with Ethereum.

**First approach:** Generate SIWE message on frontend using `siwe` package:

```typescript
import { SiweMessage } from "siwe";

const siweMessage = new SiweMessage({
  domain: window.location.host,
  address,
  statement: "Sign in to App",
  uri: window.location.origin,
  version: "1",
  chainId,
  nonce: nonceFromBackend,
  issuedAt: new Date().toISOString(),
});

const message = siweMessage.prepareMessage();
const signature = await signMessageAsync({ message });
```

**Result:** Worked for MetaMask, but failed for Coinbase Smart Wallet.

---

## Step 6: Understanding the Smart Wallet Problem

**Discovery:** Smart wallets use EIP-1271 for signature verification, not standard `ecrecover`.

| Wallet Type | Signs With | Verify With |
|-------------|-----------|-------------|
| EOA (MetaMask) | Private key | `ecrecover` |
| Smart Wallet | Contract logic | EIP-1271 `isValidSignature` |

The `siwe` library's `verify()` only supports EOA signatures.

---

## Step 7: Backend-Generated Messages

**Decision:** Have backend generate the SIWE message for consistency.

**New flow:**
1. Frontend requests message from backend
2. Backend generates and stores nonce, returns prepared message
3. Frontend signs message as-is (no re-preparation!)
4. Frontend sends message + signature to backend

**Added types in `types/api.ts`:**
```typescript
export interface WalletMessageRequest {
  address: string;
  chainId: number;
}

export interface WalletMessageResponse {
  message: string;
}

export interface WalletSignInRequest {
  message: string;
  signature: string;
  verified?: boolean;  // For smart wallets
}
```

**Added API methods in `lib/auth.ts`:**
```typescript
getWalletMessage: (data: WalletMessageRequest) =>
  apiClient.post<WalletMessageResponse>("/api/v1/auth/wallet/message", data),

walletSignIn: (data: WalletSignInRequest) =>
  apiClient.post<WalletSignInResponse>("/api/v1/auth/wallet/signin", data),
```

---

## Step 8: The `prepareMessage()` Trap

**Mistake:** We tried parsing the backend message with `SiweMessage` and calling `prepareMessage()` again:

```typescript
// WRONG - causes "invalid signature"
const siweMessage = new SiweMessage(message);
const preparedMessage = siweMessage.prepareMessage();
const signature = await signMessageAsync({ message: preparedMessage });
```

**Problem:** Backend already called `prepareMessage()`. Calling it again can produce slightly different formatting, causing signature mismatch.

**Fix:** Sign the message directly as received from backend:

```typescript
// CORRECT
const message = messageResponse.data.message;
const signature = await signMessageAsync({ message });
```

---

## Step 9: Adding Smart Wallet Detection

**Goal:** Detect smart wallets and verify signatures on frontend when possible.

**Approach:** Check if address has bytecode (deployed contract):

```typescript
const bytecode = await publicClient.getCode({ address });
const isSmartWallet = bytecode && bytecode !== "0x";
```

**Why `bytecode &&`?**
- If RPC fails, `getCode` returns `undefined`
- `undefined && anything` = `false`
- Safely treats RPC failure as "not a smart wallet"

---

## Step 10: EIP-1271 Frontend Verification

**Implementation:** For deployed smart wallets, verify signature on frontend:

```typescript
// EIP-1271 constants
const EIP1271_MAGIC_VALUE = "0x1626ba7e";
const EIP1271_ABI = [
  {
    name: "isValidSignature",
    type: "function",
    inputs: [
      { name: "hash", type: "bytes32" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4" }],
  },
] as const;

// Verification
if (isSmartWallet) {
  toast.info("Smart wallet detected");

  try {
    const messageHash = hashMessage(message);
    const result = await publicClient.readContract({
      address,
      abi: EIP1271_ABI,
      functionName: "isValidSignature",
      args: [messageHash, signature as `0x${string}`],
    });
    verified = result === EIP1271_MAGIC_VALUE;
  } catch {
    // Let backend handle it
    verified = undefined;
  }
}
```

---

## Step 11: The `verified` Flag

**Purpose:** Tell backend we've already verified the signature.

```typescript
const signInResponse = await signInMutation.mutateAsync({
  message,
  signature,
  ...(verified === true && { verified: true }),
});
```

**When it's sent:**
- Smart wallet detected AND EIP-1271 verification succeeded → `verified: true`
- EOA wallet → no flag sent
- Smart wallet but verification failed → no flag sent (backend will retry)

**Why backend trusts it:**
For undeployed smart wallets, there's no bytecode to check and no contract to call. Frontend verification is the only option.

---

## Step 12: Failed Attempts Along the Way

### Attempt: `isWalletACoinbaseSmartWallet` from OnchainKit

```typescript
import { isWalletACoinbaseSmartWallet } from "@coinbase/onchainkit/wallet";

const result = await isWalletACoinbaseSmartWallet({
  client: publicClient,
  userOp: { sender: address, /* ...many required fields */ },
});
```

**Why abandoned:** Required a full UserOperation object with many dummy values. Overkill for our use case.

### Attempt: `useMiniKit` context check

```typescript
import { useMiniKit } from "@coinbase/onchainkit/minikit";

const { context } = useMiniKit();
const isBaseApp = context?.client?.clientFid === "309857";
```

**Why abandoned:** Only works when running inside Base app, not for general smart wallet detection.

---

## Step 13: RPC 401 Error

**Problem:** Got 401 Unauthorized from Coinbase RPC during bytecode check.

**Cause:** Invalid or missing `NEXT_PUBLIC_ONCHAINKIT_API_KEY`.

**Solution:** Get API key from [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com).

**Why it didn't break sign-in:** The bytecode check is wrapped in try-catch, so RPC failures are silently ignored and sign-in proceeds without smart wallet verification.

---

## Final Implementation

### `hooks/use-wallet-auth.ts`

```typescript
import { useState, useCallback, useEffect, useRef } from "react";
import {
  useAccount,
  useSignMessage,
  useChainId,
  useSwitchChain,
  usePublicClient,
} from "wagmi";
import { hashMessage } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useGetWalletMessage, useWalletSignIn, authApi } from "@/lib/auth";
import { useUserProfile } from "@/lib/user";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

// EIP-1271 constants (same as backend)
const EIP1271_MAGIC_VALUE = "0x1626ba7e";
const EIP1271_ABI = [
  {
    name: "isValidSignature",
    type: "function",
    inputs: [
      { name: "hash", type: "bytes32" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4" }],
  },
] as const;

const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;

export const useWalletAuth = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profileChecked = useRef(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const getMessageMutation = useGetWalletMessage();
  const signInMutation = useWalletSignIn();

  const { user, updateUserData, logout: storeLogout } = useAuthStore();

  const isWrongNetwork = isConnected && chainId !== EXPECTED_CHAIN_ID;

  const switchToCorrectNetwork = useCallback(async () => {
    try {
      await switchChain({ chainId: EXPECTED_CHAIN_ID });
      toast.success("Switched to correct network");
    } catch (err) {
      toast.error("Failed to switch network. Please switch manually.");
    }
  }, [switchChain]);

  const signIn = useCallback(async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (chainId !== EXPECTED_CHAIN_ID) {
      toast.error("Please switch to the correct network");
      return;
    }

    setIsSigningIn(true);
    setError(null);

    try {
      // Step 1: Get SIWE message from backend
      const messageResponse = await getMessageMutation.mutateAsync({
        address,
        chainId: EXPECTED_CHAIN_ID,
      });

      if (!messageResponse.data?.message) {
        throw new Error("Failed to get message");
      }

      const message = messageResponse.data.message;

      // Step 2: Sign the message with wallet
      const signature = await signMessageAsync({ message });

      // Step 3: Check if smart wallet and verify on frontend
      let verified: boolean | undefined;
      if (publicClient && address) {
        try {
          const bytecode = await publicClient.getCode({ address });
          const isSmartWallet = bytecode && bytecode !== "0x";

          if (isSmartWallet) {
            toast.info("Smart wallet detected");

            try {
              const messageHash = hashMessage(message);
              const result = await publicClient.readContract({
                address,
                abi: EIP1271_ABI,
                functionName: "isValidSignature",
                args: [messageHash, signature as `0x${string}`],
              });
              verified = result === EIP1271_MAGIC_VALUE;
              if (verified) {
                console.log("✅ EIP-1271 verification: SUCCESS");
              }
            } catch {
              console.log("ℹ️ EIP-1271 failed, backend will retry");
              verified = undefined;
            }
          }
        } catch {
          // RPC error, proceed without smart wallet check
        }
      }

      // Step 4: Verify with backend and get tokens
      const signInResponse = await signInMutation.mutateAsync({
        message,
        signature,
        ...(verified === true && { verified: true }),
      });

      if (signInResponse.data?.user) {
        updateUserData(
          signInResponse.data.user,
          signInResponse.data.user.wallet?.balance
        );
        queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        toast.success("Successfully signed in!");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to sign in";
      setError(errorMessage);

      if (errorMessage.toLowerCase().includes("rejected")) {
        toast.error("Sign in cancelled");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [
    address,
    isConnected,
    chainId,
    getMessageMutation,
    signInMutation,
    signMessageAsync,
    publicClient,
    updateUserData,
    queryClient,
  ]);

  const signOut = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      storeLogout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      profileChecked.current = false;
      queryClient.clear();
    }
  }, [storeLogout, queryClient]);

  return {
    isWalletConnected: isConnected,
    isAuthenticated: !!user && isConnected,
    isLoading: isSigningIn || getMessageMutation.isPending || signInMutation.isPending,
    showSignIn: isConnected && !user && !isLoadingProfile && (isFetched || isProfileError),
    error,
    isWrongNetwork,
    isSwitchingNetwork,
    switchToCorrectNetwork,
    signIn,
    signOut,
  };
};
```

---

## Key Learnings

1. **Don't double-prepare SIWE messages** - If backend prepares it, sign it directly
2. **Smart wallets need EIP-1271** - Standard signature verification doesn't work
3. **Bytecode check for smart wallet detection** - `getCode()` returns actual code for contracts
4. **Handle RPC failures gracefully** - Wrap in try-catch, don't break the flow
5. **The `verified` flag is a trust mechanism** - For undeployed smart wallets where verification isn't possible

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_api_key
NEXT_PUBLIC_CHAIN_ID=84532  # 84532 for Base Sepolia, 8453 for Base mainnet
```

---

## Dependencies

```json
{
  "wagmi": "^2.x",
  "viem": "^2.x",
  "@coinbase/onchainkit": "^0.x",
  "@tanstack/react-query": "^5.x",
  "sonner": "^1.x"
}
```
