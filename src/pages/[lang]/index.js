import Head from "next/head";

import Header from "../../components/Header";
import Banner from "../../components/Banner";
import About from "../../components/About";
import Menu from "../../components/Menu";
import Footer from "../../components/Footer";
import translations from "../../data/translations";
import { SITE_URL } from "../../config/site";
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

  const availableLanguages = businessSettings.languages.filter(
    ({ language }) =>
      Object.hasOwn(translations, language) && translations[language]?.seo
  );

  const currentLocale = availableLanguages.find(
    ({ language }) => language === lang
  )?.locale;
  return (
    <>
      <Head>
        <title>{seoData.title}</title>

        <meta name="description" content={seoData.description} />

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

        <meta property="og:site_name" content="Caldo Verde" />

        {currentLocale && (
          <meta
            property="og:locale"
            content={currentLocale.replace(/-/g, "_")}
          />
        )}

        <link rel="icon" href="/logo_cv.ico" />
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
