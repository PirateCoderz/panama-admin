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
    NEXT_PUBLIC_ADMIN_ORIGIN: "https://admin.panamatravel.co.uk",
    NEXT_PUBLIC_ADMIN_UPLOAD_ORIGIN: "https://admin.panamatravel.co.uk",

    NEXT_PUBLIC_SITE_ORIGIN: "https://panamatravel.co.uk",

    IMAGEKIT_ID: "8lpztmifb",
    IMAGEKIT_PUBLIC_KEY: "public_JTAgYImkR0BrnLBiH8LguJ7FMPw=",
    IMAGEKIT_PRIVATE_KEY: "private_6PG0VcYdQ3bSfma5w4QQYfRtYX4=",
    IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/8lpztmifb",
    IMAGEKIT_FOLDER_BASE: "/panama/blogs",       // customize the root folder in IK

    // # CORS(adjust as needed)
    ALLOWED_ORIGINS: "https://panamatravel.co.uk,https://www.panamatravel.co.uk,http://localhost:3000,http://localhost:5173"


  }
};

export default nextConfig;
