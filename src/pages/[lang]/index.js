import Head from "next/head";

import Header from "../../components/Header";
import Banner from "../../components/Banner";
import About from "../../components/About";
import Menu from "../../components/Menu";
import Footer from "../../components/Footer";
import translations from "../../data/translations";
import { SITE_URL } from "../../config/site";
import {
  getAlternateLinks,
  getPageLanguages,
} from "../../utils/pageAlternates";
import RestaurantSchema from "../../components/RestaurantSchema";
import { getPublicMenuCategories } from "../../server/menuService";
import { getPublicBusinessSettings } from "../../server/businessSettingsService";

export default function LanguageHome({
  lang,
  menuCategories,
  businessSettings,
}) {
  const seoData = translations[lang].seo;
  const canonicalUrl = `${SITE_URL}/${lang}`;
  const pageSuffix = "";

  const availableLanguages = getPageLanguages(
    businessSettings.languages,
    pageSuffix
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

        <link rel="canonical" href={canonicalUrl} />

        {getAlternateLinks({
          languages: businessSettings.languages,
          defaultLanguage: businessSettings.defaultLanguage,
          pageSuffix,
        }).map(({ hrefLang, href }) => (
          <link
            key={`alternate-${hrefLang}`}
            rel="alternate"
            hrefLang={hrefLang}
            href={href}
          />
        ))}

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
      <RestaurantSchema
        url={canonicalUrl}
        businessSettings={businessSettings}
        language={lang}
      />
      <Header businessSettings={businessSettings} />

      <main id="main-content" tabIndex={-1}>
        <Banner />
        <About />
        <Menu menuCategories={menuCategories} />
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
        destination: `/${defaultLanguage}`,
        permanent: false,
      },
    };
  }

  if (!Object.hasOwn(translations, lang) || !translations[lang]?.seo) {
    return { notFound: true };
  }

  const menuCategories = await getPublicMenuCategories({
    languages,
    defaultLanguage,
  });

  return {
    props: {
      lang,
      menuCategories,
      businessSettings,
    },
  };
}
