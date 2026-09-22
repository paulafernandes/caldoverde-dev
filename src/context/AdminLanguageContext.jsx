import { createContext, useContext, useSyncExternalStore } from "react";

import { ADMIN_LANGUAGES, adminTranslations } from "../data/adminTranslations";

const AdminLanguageContext = createContext(null);

const STORAGE_KEY = "caldo-verde-admin-language";
const DEFAULT_LANGUAGE = "pt";

const listeners = new Set();

function getLanguage() {
  const storedLanguage = localStorage.getItem(STORAGE_KEY);

  return ADMIN_LANGUAGES.includes(storedLanguage)
    ? storedLanguage
    : DEFAULT_LANGUAGE;
}

function getServerLanguage() {
  return DEFAULT_LANGUAGE;
}

function subscribe(callback) {
  listeners.add(callback);

  function handleStorage(event) {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function AdminLanguageProvider({ children }) {
  const language = useSyncExternalStore(
    subscribe,
    getLanguage,
    getServerLanguage
  );

  function changeLanguage(newLanguage) {
    if (!ADMIN_LANGUAGES.includes(newLanguage)) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, newLanguage);

    listeners.forEach((listener) => listener());
  }

  function t(key, variables = {}) {
    const value = key
      .split(".")
      .reduce((current, part) => current?.[part], adminTranslations[language]);

    if (typeof value !== "string") {
      return value ?? key;
    }

    return Object.entries(variables).reduce(
      (text, [name, replacement]) =>
        text.split(`{${name}}`).join(String(replacement)),
      value
    );
  }

  return (
    <AdminLanguageContext.Provider
      value={{
        language,
        languages: ADMIN_LANGUAGES,
        changeLanguage,
        t,
      }}
    >
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const context = useContext(AdminLanguageContext);

  if (!context) {
    throw new Error(
      "useAdminLanguage must be used inside AdminLanguageProvider"
    );
  }

  return context;
}
