import { getPublicBusinessSettings } from "../server/businessSettingsService";

export async function getServerSideProps() {
  const businessSettings = await getPublicBusinessSettings();

  const defaultLanguage = businessSettings?.defaultLanguage;

  const isDefaultLanguageEnabled = businessSettings?.languages.some(
    ({ language }) => language === defaultLanguage
  );

  if (!defaultLanguage || !isDefaultLanguageEnabled) {
    return {
      notFound: true,
    };
  }

  return {
    redirect: {
      destination: `/${defaultLanguage}`,
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
