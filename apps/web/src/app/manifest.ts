import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anh ngữ Minh Hương",
    short_name: "Minh Hương",
    description: "Ứng dụng học tiếng Anh dành cho gia đình",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8ff",
    theme_color: "#6558f5",
    orientation: "portrait-primary",
    categories: ["education", "kids"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
