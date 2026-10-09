import { SITE_URL } from "../config/site";
import { getAdministrativeAreaConfig } from "../data/administrativeAreas";
import { getBusinessLocationUrl } from "../utils/businessAddress";
import { groupOpeningHoursByDay } from "../utils/openingHours";

// Nomes do schema.org pela ordem de DAYS_OF_WEEK (1 = segunda … 7 = domingo).
const SCHEMA_ORG_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function optionalText(value) {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

export default function RestaurantSchema({
  url,
  businessSettings,
  language = "es",
}) {
  if (!businessSettings) {
    return null;
  }

  const countryCode = optionalText(businessSettings.countryCode)?.toUpperCase();

  const areaConfig = getAdministrativeAreaConfig(countryCode);
  const area = areaConfig?.areas.find(
    (item) => item.code === businessSettings.administrativeAreaCode
  );

  const addressFields = {
    streetAddress:
      [
        optionalText(businessSettings.addressLine1),
        optionalText(businessSettings.addressLine2),
      ]
        .filter(Boolean)
        .join(", ") || undefined,
    postalCode: optionalText(businessSettings.postalCode),
    addressLocality: optionalText(businessSettings.city),
    addressRegion: area?.label[language] ?? area?.label.en,
    addressCountry: countryCode,
  };

  const hasAddress = Object.values(addressFields).some(Boolean);

  const telephone =
    optionalText(businessSettings.phone) ??
    optionalText(businessSettings.mobilePhone);

  // Um intervalo que passa a meia-noite fica no dia em que abre.
  const openingHoursSpecification = groupOpeningHoursByDay(
    businessSettings.openingHours
  ).flatMap(({ dayOfWeek, intervals }) =>
    intervals.map(({ opensAt, closesAt }) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_ORG_DAYS[dayOfWeek - 1],
      opens: opensAt,
      closes: closesAt,
    }))
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: optionalText(businessSettings.name),
    url,
    image: `${SITE_URL}/og-image.png`,
    logo: `${SITE_URL}/assets/images/logo_andorinha.png`,
    email: optionalText(businessSettings.email),
    telephone,
    address: hasAddress
      ? {
          "@type": "PostalAddress",
          ...addressFields,
        }
      : undefined,
    hasMap: getBusinessLocationUrl(businessSettings) ?? undefined,
    menu: `${url}#ementa`,
    servesCuisine: "Portuguese",
    openingHoursSpecification:
      openingHoursSpecification.length > 0
        ? openingHoursSpecification
        : undefined,
  };

  return (
    <script
      id="restaurant-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
