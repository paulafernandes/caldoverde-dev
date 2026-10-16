import translations from "../data/translations";
import { SITE_URL } from "../config/site";

// Páginas públicas com versões por idioma (caminho depois de /[lang]) e a
// condição para um idioma ter essa página. Usado no <head> e no sitemap.
export const PUBLIC_PAGES = {
  "": (text) => Boolean(text?.seo),
  "/about": (text) =>
    Boolean(text?.aboutPage?.seo && text?.aboutPage?.imageAlt),
};

// Idioma com textos do site para a página inicial (a mesma condição que /[lang]
// exige). No admin, usar só no servidor: importa translations.js.
export function isPublicSiteLanguage(language) {
  return (
    Object.hasOwn(translations, language) &&
    PUBLIC_PAGES[""](translations[language])
  );
}

// Única regra de construção do URL público de uma página num idioma.
export function getPageUrl(language, pageSuffix) {
  return `${SITE_URL}/${encodeURIComponent(language)}${pageSuffix}`;
}

// Idiomas ativos (já filtrados por getPublicBusinessSettings) que têm a página.
export function getPageLanguages(languages, pageSuffix) {
  const hasPage = PUBLIC_PAGES[pageSuffix];

  return languages.filter(
    ({ language }) =>
      Object.hasOwn(translations, language) && hasPage(translations[language])
  );
}

// Alternates hreflang de uma página: um por idioma e x-default para o idioma
// predefinido, só se este tiver a página.
export function getAlternateLinks({ languages, defaultLanguage, pageSuffix }) {
  const pageLanguages = getPageLanguages(languages, pageSuffix);

  const links = pageLanguages.map(({ language }) => ({
    hrefLang: language,
    href: getPageUrl(language, pageSuffix),
  }));

  if (pageLanguages.some(({ language }) => language === defaultLanguage)) {
    links.push({
      hrefLang: "x-default",
      href: getPageUrl(defaultLanguage, pageSuffix),
    });
  }

  return links;
}
