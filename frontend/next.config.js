{
  "name": "hireflow-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    "axios": "^1.6.8",
    "zustand": "^4.5.2",
    "next-auth": "^4.24.7",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-badge": "^1.0.0",
    "lucide-react": "^0.368.0",
    "recharts": "^2.12.6",
    "react-dropzone": "^14.2.3",
    "react-hot-toast": "^2.4.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1"
  }
}







//added separately
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow images from any HTTPS source (company logos, avatars)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "localhost" },
    ],
  },

  // Proxy /api calls to FastAPI backend in dev
  async rewrites() {
    return [
      {
        source:      "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/:path*`,
      },
    ];
  },

  // Suppress hydration warnings from browser extensions
  experimental: {
    optimizePackageImports: ["zustand"],
  },
};

module.exports = nextConfig;

const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};
module.exports = nextConfig;