import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { authInterrupts: true },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.mercadopago.com https://*.ably.io wss://*.ably.io; frame-src https://www.mercadopago.com https://*.mercadopago.com; font-src 'self' data:; base-uri 'self'; form-action 'self' https://*.mercadopago.com; frame-ancestors 'none'" }
      ]
    }];
  }
};

export default nextConfig;
