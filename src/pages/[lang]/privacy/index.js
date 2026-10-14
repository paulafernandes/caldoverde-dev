import Head from "next/head";

import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import LegalPage from "../../../components/LegalPage";
import translations from "../../../data/translations";
import privacyPolicy from "../../../data/legal/privacy";
import { SITE_URL } from "../../../config/site";
import { getPublicBusinessSettings } from "../../../server/businessSettingsService";
import {
  formatLegalDate,
  resolveLegalDocument,
} from "../../../utils/legalDocument";

export default function PrivacyPage({ lang, businessSettings, legalDocument }) {
  const text = translations[lang].privacyPage;
  const seoData = text.seo;
  const canonicalUrl = `${SITE_URL}/${lang}/privacy`;
  const pageSuffix = "/privacy";
  const contentText = translations[legalDocument.contentLanguage].privacyPage;
  const hasSections = legalDocument.sections.length > 0;

  const availableLanguages = businessSettings.languages.filter(
    ({ language }) =>
      Object.hasOwn(translations, language) &&
      translations[language]?.privacyPage?.seo
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
          inPreparationText={text.inPreparation}
          opensInNewTabText={
            translations[legalDocument.contentLanguage].footer.opensInNewTab
          }
        />
      </main>
      <Footer businessSettings={businessSettings} />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { lang } = params;

  if (!Object.hasOwn(translations, lang)) {
    return { notFound: true };
  }

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

  const isLanguageEnabled = languages.some(({ language }) => language === lang);

  if (!isLanguageEnabled) {
    return {
      redirect: {
        destination: `/${defaultLanguage}/privacy`,
        permanent: false,
      },
    };
  }

  if (!translations[lang]?.privacyPage?.seo) {
    return { notFound: true };
  }

  const resolvedDocument = resolveLegalDocument(
    privacyPolicy,
    lang,
    defaultLanguage
  );

  // O texto do idioma predefinido só serve se houver traduções de interface para ele.
  const legalDocument = Object.hasOwn(
    translations,
    resolvedDocument.contentLanguage
  )
    ? resolvedDocument
    : resolveLegalDocument(privacyPolicy, lang, lang);

  const contentLocale =
    languages.find(({ language }) => language === legalDocument.contentLanguage)
      ?.locale ?? legalDocument.contentLanguage;

  const lastUpdatedText = formatLegalDate(
    legalDocument.lastUpdated,
    contentLocale
  );

  return {
    props: {
      lang,
      businessSettings,
      legalDocument: {
        title: legalDocument.title ?? null,
        lastUpdated: lastUpdatedText ? legalDocument.lastUpdated : null,
        lastUpdatedText,
        sections: legalDocument.sections,
        contentLanguage: legalDocument.contentLanguage,
      },
    },
  };
}
