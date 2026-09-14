import "@/styles/globals.css";

import { AdminLanguageProvider } from "../context/AdminLanguageContext";
import { LanguageProvider } from "../context/LanguageContext";

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <AdminLanguageProvider>
        <Component {...pageProps} />
      </AdminLanguageProvider>
    </LanguageProvider>
  );
}
