import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com", "ik.imagekit.io"],
  },
  env: {

    // NODE_ENV: "production",
    DB_HOST: "92.205.172.11",
    DB_PORT: "3306",
    DB_USER: "rootweb",
    DB_PASS: "innoHorizon!!2121",
    DB_NAME: "panama",
    NEXT_PUBLIC_ADMIN_ORIGIN: "https://admin.panamatravel.co.uk",
    NEXT_PUBLIC_ADMIN_UPLOAD_ORIGIN: "https://admin.panamatravel.co.uk",

    NEXT_PUBLIC_SITE_ORIGIN: "https://panamatravel.co.uk",

 
    // # CORS(adjust as needed)
    ALLOWED_ORIGINS: "https://panamatravel.co.uk,https://www.panamatravel.co.uk,http://localhost:3000,http://localhost:5173"

  },
};

export default nextConfig;
