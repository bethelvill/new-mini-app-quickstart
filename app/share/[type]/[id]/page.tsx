import { Metadata } from "next";
import { redirect } from "next/navigation";

const ROOT_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

interface SharePageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
  searchParams: Promise<{
    title?: string;
    amount?: string;
    username?: string;
    pool?: string;
    players?: string;
    option?: string;
    percentage?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SharePageProps): Promise<Metadata> {
  const { type, id } = await params;
  const query = await searchParams;

  // Build OG image URL with query params
  const ogParams = new URLSearchParams();
  ogParams.set("type", type);
  if (query.title) ogParams.set("title", query.title);
  if (query.amount) ogParams.set("amount", query.amount);
  if (query.username) ogParams.set("username", query.username);
  if (query.pool) ogParams.set("pool", query.pool);
  if (query.players) ogParams.set("players", query.players);
  if (query.option) ogParams.set("option", query.option);
  if (query.percentage) ogParams.set("percentage", query.percentage);

  const imageUrl = `${ROOT_URL}/api/og?${ogParams.toString()}`;

  // Determine title and description based on type
  let title = "ShowStakr";
  let description = "Predict entertainment show outcomes and win USDC!";

  if (type === "stake") {
    title = query.username
      ? `${query.username} staked on ShowStakr`
      : "Stake Placed on ShowStakr";
    description = query.title || "Make your prediction and win USDC!";
  } else if (type === "win") {
    title = query.username
      ? `${query.username} won on ShowStakr!`
      : "Winner on ShowStakr!";
    description = query.title || "Called it right and won USDC!";
  } else if (type === "first") {
    title = query.username
      ? `${query.username} made their first prediction!`
      : "First Prediction on ShowStakr";
    description = "Join and make your first prediction!";
  } else if (type === "poll") {
    title = query.title || "Prediction on ShowStakr";
    description = `${query.pool || "0"} USDC pool with ${query.players || "0"} players`;
  }

  // Determine the launch URL
  const launchUrl = type === "poll" ? `${ROOT_URL}/polls/${id}` : ROOT_URL;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl,
        button: {
          title: type === "poll" ? "View Poll" : "Open ShowStakr",
          action: {
            name: "Launch ShowStakr",
            type: "launch_frame",
            url: launchUrl,
          },
        },
      }),
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { type, id } = await params;

  // Redirect to appropriate page
  if (type === "poll") {
    redirect(`/polls/${id}`);
  }

  // For other types, redirect to home
  redirect("/");
}
