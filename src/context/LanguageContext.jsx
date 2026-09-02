import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LanguageContext = createContext(undefined);

const supportedLanguages = ["pt", "es", "en"];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("pt");

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = useCallback(
    (newLanguage) => {
      if (!supportedLanguages.includes(newLanguage)) {
        return;
      }

      setLanguage(newLanguage);
    },
    []
  );

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage }}
    >
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