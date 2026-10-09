import "@/styles/globals.css";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { Cormorant_Garamond, Jost } from "next/font/google";

import {
  AdminLanguageProvider,
  useAdminLanguage,
} from "../context/AdminLanguageContext";

import { LanguageProvider, useLanguage } from "../context/LanguageContext";

// Fontes alojadas pelo Next (sem pedidos ao Google no browser).
// Só os pesos usados em globals.css e Admin.module.css; o itálico continua sintetizado.
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

function DocumentLanguage({ isAdminPage, isPublicLanguagePage }) {
  const { language: publicLanguage } = useLanguage();
  const { language: adminLanguage } = useAdminLanguage();

  const documentLanguage = isAdminPage
    ? adminLanguage
    : isPublicLanguagePage
      ? publicLanguage
      : "en";

  useEffect(() => {
    document.documentElement.lang = documentLanguage;
  }, [documentLanguage]);

  return null;
}

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const isPublicLanguagePage =
    router.pathname === "/[lang]" || router.pathname.startsWith("/[lang]/");

  const isAdminPage =
    router.pathname === "/admin" || router.pathname.startsWith("/admin/");

  const routeLanguage = isPublicLanguagePage ? router.query.lang : undefined;

  return (
    <LanguageProvider
      routeLanguage={routeLanguage}
      businessSettings={
        isPublicLanguagePage ? pageProps.businessSettings : null
      }
    >
      <AdminLanguageProvider>
        <style jsx global>{`
          :root {
            --font-cormorant: ${cormorantGaramond.style.fontFamily};
            --font-jost: ${jost.style.fontFamily};
          }
        `}</style>
        <DocumentLanguage
          isAdminPage={isAdminPage}
          isPublicLanguagePage={isPublicLanguagePage}
        />
        <Component {...pageProps} />
      </AdminLanguageProvider>
    </LanguageProvider>
  );
}
