import { getAdministrativeAreaConfig } from "../data/administrativeAreas";

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function getBusinessAddressLines(settings, language = "es") {
  if (!settings) {
    return [];
  }

  const countryCode = cleanText(settings.countryCode).toUpperCase();
  const administrativeAreaCode = cleanText(settings.administrativeAreaCode);

  const areaConfig = getAdministrativeAreaConfig(countryCode);
  const area = areaConfig?.areas.find(
    (item) => item.code === administrativeAreaCode
  );

  const areaName = area?.label[language] ?? area?.label.en ?? "";

  let countryName = "";

  if (/^[A-Z]{2}$/.test(countryCode)) {
    countryName =
      new Intl.DisplayNames([language], {
        type: "region",
        fallback: "none",
      }).of(countryCode) ?? "";
  }

  const localityLine = [
    cleanText(settings.postalCode),
    cleanText(settings.city),
  ]
    .filter(Boolean)
    .join(" ");

  const regionLine = [areaName, countryName].filter(Boolean).join(", ");

  return [
    cleanText(settings.addressLine1),
    cleanText(settings.addressLine2),
    localityLine,
    regionLine,
  ].filter(Boolean);
}

export function getBusinessLocationUrl(settings) {
  const value = cleanText(settings?.locationUrl);

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
