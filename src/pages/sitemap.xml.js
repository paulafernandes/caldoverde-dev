import {
  PUBLIC_PAGES,
  getAlternateLinks,
  getPageLanguages,
  getPageUrl,
} from "../utils/pageAlternates";
import { getPublicBusinessSettings } from "../server/businessSettingsService";

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemap(languages, defaultLanguage) {
  const urls = languages
    .flatMap(({ language }) =>
      Object.keys(PUBLIC_PAGES)
        .filter((pageSuffix) =>
          getPageLanguages(languages, pageSuffix).some(
            (pageLanguage) => pageLanguage.language === language
          )
        )
        .map((pageSuffix) => {
          const alternates = getAlternateLinks({
            languages,
            defaultLanguage,
            pageSuffix,
          })
            .map(
              ({ hrefLang, href }) =>
                `    <xhtml:link rel="alternate" hreflang="${escapeXml(hrefLang)}" href="${escapeXml(href)}"/>`
            )
            .join("\n");

          return `  <url>
    <loc>${escapeXml(getPageUrl(language, pageSuffix))}</loc>
${alternates}
  </url>`;
        })
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
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
  res.end(generateSitemap(languages, defaultLanguage));

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null;
}
