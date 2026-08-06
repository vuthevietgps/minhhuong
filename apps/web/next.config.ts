import type { NextConfig } from "next";

if (process.env.DEPLOYMENT_ENVIRONMENT === "hosted-staging") {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!publicApiUrl || new URL(publicApiUrl).protocol !== "https:") {
    throw new Error(
      "Hosted staging requires NEXT_PUBLIC_API_URL to be an explicit HTTPS URL",
    );
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
