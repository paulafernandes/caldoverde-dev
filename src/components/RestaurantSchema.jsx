import { SITE_URL } from "../config/site";
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

  const telephone =
    optionalText(businessSettings.phone) ??
    optionalText(businessSettings.mobilePhone);

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
