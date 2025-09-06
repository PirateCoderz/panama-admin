import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  env: {

    // NODE_ENV: "production",
    DB_HOST: "92.205.172.11",
    DB_PORT: "3306",
    DB_USER: "rootweb",
    DB_PASS: "innoHorizon!!2121",
    DB_NAME: "panama",

  }
};

export default nextConfig;
