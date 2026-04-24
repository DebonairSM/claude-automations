/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
  async rewrites() {
    return [{ source: "/", destination: "/api/mcp" }];
  },
};

export default nextConfig;
