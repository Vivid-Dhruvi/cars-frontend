export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/car-rental-damage-scanner/",
        disallow: [
          "/car-rental-damage-scanner/admin",
          "/car-rental-damage-scanner/admin/",
          "/car-rental-damage-scanner/api/",
        ],
      },
    ],
    sitemap: "https://carinsurent.com/car-rental-damage-scanner/sitemap.xml",
  };
}
