import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const LanguageContext = createContext(undefined);

export function LanguageProvider({
  children,
  routeLanguage,
  businessSettings,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const languages = useMemo(
    () => businessSettings?.languages.map(({ language }) => language) ?? [],
    [businessSettings]
  );

  const defaultLanguage = languages.includes(businessSettings?.defaultLanguage)
    ? businessSettings.defaultLanguage
    : null;

  const language = languages.includes(routeLanguage)
    ? routeLanguage
    : languages.includes(selectedLanguage)
      ? selectedLanguage
      : defaultLanguage;

  const changeLanguage = useCallback(
    (newLanguage) => {
      if (!languages.includes(newLanguage)) {
        return;
      }

      setSelectedLanguage(newLanguage);
    },
    [languages]
  );

  return (
    <LanguageContext.Provider
      value={{ language, languages, defaultLanguage, changeLanguage }}
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
