import { getAdministrativeAreaConfig } from "../data/administrativeAreas";
import { getBusinessLocationUrl } from "../utils/businessAddress";

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

  const phones = [
    ...new Set(
      [
        optionalText(businessSettings.phone),
        optionalText(businessSettings.mobilePhone),
      ].filter(Boolean)
    ),
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: optionalText(businessSettings.name),
    url,
    email: optionalText(businessSettings.email),
    telephone: phones.length > 0 ? phones : undefined,
    address: hasAddress
      ? {
          "@type": "PostalAddress",
          ...addressFields,
        }
      : undefined,
    hasMap: getBusinessLocationUrl(businessSettings) ?? undefined,
    servesCuisine: "Portuguese",
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
