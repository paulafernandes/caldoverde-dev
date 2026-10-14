import Head from "next/head";

import Header from "./Header";
import Footer from "./Footer";
import LegalPage from "./LegalPage";
import translations from "../data/translations";
import { SITE_URL } from "../config/site";

// Página legal completa (SEO, cabeçalho, texto e rodapé), partilhada pela
// política de privacidade e pelo aviso legal.
// path: caminho depois de /[lang]; textKey: chave em translations com o seo da página.
export default function LegalDocumentPage({
  lang,
  businessSettings,
  legalDocument,
  path,
  textKey,
}) {
  const seoData = translations[lang][textKey].seo;
  const sharedText = translations[lang].legalPage;
  const canonicalUrl = `${SITE_URL}/${lang}/${path}`;
  const pageSuffix = `/${path}`;
  const contentText = translations[legalDocument.contentLanguage].legalPage;
  const hasSections = legalDocument.sections.length > 0;

  const availableLanguages = businessSettings.languages.filter(
    ({ language }) =>
      Object.hasOwn(translations, language) &&
      translations[language]?.[textKey]?.seo
  );

  const currentLocale = availableLanguages.find(
    ({ language }) => language === lang
  )?.locale;

  const ogImageUrl = `${SITE_URL}/og-image.png`;
  const alternateLocales = availableLanguages
    .filter(({ language }) => language !== lang)
    .map(({ locale }) => locale.replace(/-/g, "_"));

  return (
    <>
      <Head>
        <title>{seoData.title}</title>

        <meta name="description" content={seoData.description} />

        {!hasSections && <meta name="robots" content="noindex" />}

        <link rel="canonical" href={canonicalUrl} />

        {availableLanguages.map(({ language }) => (
          <link
            key={`alternate-${language}`}
            rel="alternate"
            hrefLang={language}
            href={`${SITE_URL}/${language}${pageSuffix}`}
          />
        ))}

        {availableLanguages.some(
          ({ language }) => language === businessSettings.defaultLanguage
        ) && (
          <link
            key="alternate-default"
            rel="alternate"
            hrefLang="x-default"
            href={`${SITE_URL}/${businessSettings.defaultLanguage}${pageSuffix}`}
          />
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:type" content="website" />

        <meta property="og:title" content={seoData.title} />

        <meta property="og:description" content={seoData.description} />

        <meta property="og:url" content={canonicalUrl} />

        <meta property="og:site_name" content={businessSettings.name} />

        <meta property="og:image" content={ogImageUrl} />

        <meta property="og:image:width" content="1200" />

        <meta property="og:image:height" content="630" />

        <meta
          property="og:image:alt"
          content={translations[lang].images.logo}
        />

        {currentLocale && (
          <meta
            property="og:locale"
            content={currentLocale.replace(/-/g, "_")}
          />
        )}

        {alternateLocales.map((locale) => (
          <meta
            key={`og-locale-alternate-${locale}`}
            property="og:locale:alternate"
            content={locale}
          />
        ))}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={seoData.title} />

        <meta name="twitter:description" content={seoData.description} />

        <meta name="twitter:image" content={ogImageUrl} />
      </Head>

      <Header businessSettings={businessSettings} />

      <main id="main-content" tabIndex={-1}>
        <LegalPage
          title={legalDocument.title ?? seoData.title}
          lastUpdated={legalDocument.lastUpdated}
          lastUpdatedText={legalDocument.lastUpdatedText}
          lastUpdatedLabel={contentText.lastUpdatedLabel}
          sections={legalDocument.sections}
          pageLanguage={lang}
          contentLanguage={legalDocument.contentLanguage}
          inPreparationText={sharedText.inPreparation}
          opensInNewTabText={
            translations[legalDocument.contentLanguage].footer.opensInNewTab
          }
        />
      </main>
      <Footer businessSettings={businessSettings} />
    </>
  );
}
