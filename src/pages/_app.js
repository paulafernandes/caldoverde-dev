import "@/styles/globals.css";

import { useEffect } from "react";
import { useRouter } from "next/router";

import {
  AdminLanguageProvider,
  useAdminLanguage,
} from "../context/AdminLanguageContext";

import { LanguageProvider, useLanguage } from "../context/LanguageContext";

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
    <LanguageProvider routeLanguage={routeLanguage}>
      <AdminLanguageProvider>
        <DocumentLanguage
          isAdminPage={isAdminPage}
          isPublicLanguagePage={isPublicLanguagePage}
        />
        <Component {...pageProps} />
      </AdminLanguageProvider>
    </LanguageProvider>
  );
}
