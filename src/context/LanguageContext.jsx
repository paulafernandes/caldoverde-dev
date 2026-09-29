import { createContext, useCallback, useContext, useState } from "react";

const LanguageContext = createContext(undefined);

const supportedLanguages = ["pt", "es", "en"];

export function LanguageProvider({ children, routeLanguage }) {
  const [selectedLanguage, setLanguage] = useState("pt");

  const language = supportedLanguages.includes(routeLanguage)
    ? routeLanguage
    : selectedLanguage;

  const changeLanguage = useCallback((newLanguage) => {
    if (!supportedLanguages.includes(newLanguage)) {
      return;
    }

    setLanguage(newLanguage);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error(
      "useLanguage deve ser utilizado dentro de LanguageProvider"
    );
  }

  return context;
}
