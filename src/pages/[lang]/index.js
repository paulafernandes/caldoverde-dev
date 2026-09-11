import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import Header from "../../components/Header";
import Banner from "../../components/Banner";
import About from "../../components/About";
import Menu from "../../components/Menu";
import Footer from "../../components/Footer";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../data/translations";
import { SITE_URL } from "../../config/site";
import RestaurantSchema from "../../components/RestaurantSchema";
import { getPublicMenuCategories } from "../../server/menuService";

const supportedLanguages = ["pt", "es", "en"];
const openGraphLocales = {
  pt: "pt_PT",
  es: "es_ES",
  en: "en_GB",
};

export default function LanguageHome({ menuCategories }) {
  const router = useRouter();
  const { lang } = router.query;
  const { changeLanguage } = useLanguage();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (!supportedLanguages.includes(lang)) {
      router.replace("/es/about");
      return;
    }

    changeLanguage(lang);
  }, [lang, router, changeLanguage]);

  const seoData = translations[lang].seo;
  const canonicalUrl = `${SITE_URL}/${lang}/`;

  return (
    <>
      <Head>
        <title>{seoData.title}</title>

        <RestaurantSchema url={canonicalUrl} />

        <meta name="description" content={seoData.description} />

        <link rel="canonical" href={canonicalUrl} />

        <link rel="alternate" hrefLang="es" href={`${SITE_URL}/es/`} />

        <link rel="alternate" hrefLang="pt" href={`${SITE_URL}/pt/`} />

        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en/`} />

        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/es/`} />

        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:type" content="website" />

        <meta property="og:title" content={seoData.title} />

        <meta property="og:description" content={seoData.description} />

        <meta property="og:url" content={canonicalUrl} />

        <meta property="og:site_name" content="Caldo Verde" />

        <meta property="og:locale" content={openGraphLocales[lang]} />

        <link rel="icon" href="/logo_cv.ico" />
      </Head>

      <Header />

      <main>
        <Banner />
        <About />
        <Menu menuCategories={menuCategories} />
      </main>

      <Footer />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { lang } = params;

  if (!supportedLanguages.includes(lang)) {
    return {
      redirect: {
        destination: "/es/",
        permanent: false,
      },
    };
  }

  const menuCategories = await getPublicMenuCategories();

  return {
    props: {
      menuCategories,
    },
  };
}
