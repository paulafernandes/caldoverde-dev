import { SITE_URL } from "../config/site";

const languages = ["es", "pt", "en"];

function generateSitemap() {
  const urls = languages
    .map(
      (language) => `
  <url>
    <loc>${SITE_URL}/${language}/</loc>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const sitemap = generateSitemap();

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null;
}
