import type { NextConfig } from "next";

const remotePatterns = [
  {
    protocol: "https" as const,
    hostname: "lh3.googleusercontent.com",
  },
];

if (process.env.R2_PUBLIC_URL) {
  try {
    const url = new URL(process.env.R2_PUBLIC_URL);
    if (url.protocol === "https:") {
      remotePatterns.push({
        protocol: "https",
        hostname: url.hostname,
      });
    }
  } catch {
    // Ignore invalid R2_PUBLIC_URL values and fall back to the default host list.
  }
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  images: {
    remotePatterns,
  },
};

export default nextConfig;
