import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const LanguageContext = createContext(undefined);

const supportedLanguages = ["pt", "es", "en"];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("pt");

  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "caldo-verde-language"
    );

    if (supportedLanguages.includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function changeLanguage(newLanguage) {
    if (!supportedLanguages.includes(newLanguage)) {
      return;
    }

    setLanguage(newLanguage);

    localStorage.setItem(
      "caldo-verde-language",
      newLanguage
    );
  }

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