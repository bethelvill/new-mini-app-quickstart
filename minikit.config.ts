const ROOT_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:4000";

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: process.env.FARCASTER_HEADER || "",
    payload: process.env.FARCASTER_PAYLOAD || "",
    signature: process.env.FARCASTER_SIGNATURE || "",
  },
  miniapp: {
    version: "1",
    name: "ShowStakr",
    subtitle: "Entertainment Prediction Game",
    description:
      "Predict entertainment show outcomes. Stake on your favorites and win USDC from other players!",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["predictions", "entertainment", "gaming", "crypto", "betting"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Turn Your Vibes Into Cash",
    ogTitle: "ShowStakr - Predict & Win",
    ogDescription:
      "Predict entertainment show outcomes. Stake on your favorites and win USDC from other players!",
    ogImageUrl: `${ROOT_URL}/hero.png`,
    noindex: false,
  },
} as const;
