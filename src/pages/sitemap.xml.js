import { SITE_URL } from "../config/site";
import translations from "../data/translations";
import { getPublicBusinessSettings } from "../server/businessSettingsService";

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemap(languages) {
  const urls = languages
    .flatMap(({ language }) => {
      if (!Object.hasOwn(translations, language)) {
        return [];
      }

      const pages = [];

      if (translations[language]?.seo) {
        pages.push("");
      }

      if (
        translations[language]?.aboutPage?.seo &&
        translations[language]?.aboutPage?.imageAlt
      ) {
        pages.push("/about");
      }

      return pages.map((path) => {
        const url = `${SITE_URL}/${encodeURIComponent(language)}${path}`;

        return `  <url>
    <loc>${escapeXml(url)}</loc>
  </url>`;
      });
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const businessSettings = await getPublicBusinessSettings();

  if (!businessSettings) {
    return { notFound: true };
  }

  const { languages, defaultLanguage } = businessSettings;

  const isDefaultLanguageEnabled = languages.some(
    ({ language }) => language === defaultLanguage
  );

  if (!isDefaultLanguageEnabled) {
    return { notFound: true };
  }

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.end(generateSitemap(languages));

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null;
}
