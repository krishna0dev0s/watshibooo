/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "i.imghippo.com",
      },
    ],
  },
  experimental: {
    proxyPatterns: [
      {
        source: '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        destination: '/',
      },
      {
        source: '/(api|trpc)(.*)',
        destination: '/',
      },
    ],
  },
};

export default nextConfig;
