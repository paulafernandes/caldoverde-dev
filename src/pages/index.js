import Head from "next/head";
import Header from "../components/Header";
import Banner from "../components/Banner";
import About from "../components/About";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";
import translations from "../data/translations";

export default function Home() {
  const { language } = useLanguage();
  const seo = translations[language].seo;

  return (
    <>
      <Head>
        <title>{seo.title}</title>

        <meta
          name="description"
          content={seo.description}
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Caldo Verde" />
        <meta property="og:title" content={seo.title} />
        <meta
          property="og:description"
          content={seo.description}
        />
        <meta property="og:locale" content={seo.locale} />

        <meta
          name="twitter:card"
          content="summary"
        />

        <link
          rel="canonical"
          href="https://caldoverde.es/"
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        <Banner />
        <About />
        <Menu />
      </main>

      <Footer />
    </>
  );
}