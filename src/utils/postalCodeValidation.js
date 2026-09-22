import isPostalCode from "validator/lib/isPostalCode.js";

const SUPPORTED_POSTAL_CODE_COUNTRIES = new Set([
  "AD",
  "AR",
  "AT",
  "BE",
  "BG",
  "BR",
  "CA",
  "CH",
  "CO",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GB",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MT",
  "MX",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
  "US",
]);

const POSTAL_CODE_EXAMPLES = {
  AD: "AD500",
  AR: "C1000AAA",
  AT: "1010",
  BE: "1000",
  BG: "1000",
  BR: "01001-000",
  CA: "K1A 0B1",
  CH: "8001",
  CO: "110111",
  CZ: "110 00",
  DE: "10115",
  DK: "1050",
  EE: "10111",
  ES: "41001",
  FI: "00100",
  FR: "75001",
  GB: "SW1A 1AA",
  GR: "105 52",
  HR: "10000",
  HU: "1051",
  IE: "D02 X285",
  IS: "101",
  IT: "00100",
  LI: "9490",
  LT: "01100",
  LU: "1111",
  LV: "LV-1050",
  MC: "98000",
  MT: "VLT 1117",
  MX: "01000",
  NL: "1012 AB",
  NO: "0150",
  PL: "00-001",
  PT: "1000-100",
  RO: "010011",
  SE: "111 22",
  SI: "1000",
  SK: "811 01",
  US: "10001",
};

export function canValidatePostalCode(countryCode) {
  return SUPPORTED_POSTAL_CODE_COUNTRIES.has(countryCode);
}

export function isValidPostalCode(countryCode, postalCode) {
  const normalizedCountryCode = countryCode?.trim().toUpperCase();
  const normalizedPostalCode = postalCode?.trim();

  if (!normalizedCountryCode || !normalizedPostalCode) {
    return false;
  }

  if (!canValidatePostalCode(normalizedCountryCode)) {
    return true;
  }

  return isPostalCode(normalizedPostalCode, normalizedCountryCode);
}

export function getPostalCodeExample(countryCode) {
  const normalizedCountryCode = countryCode?.trim().toUpperCase();

  return POSTAL_CODE_EXAMPLES[normalizedCountryCode] ?? "";
}

export function normalizePostalCode(countryCode, postalCode) {
  const normalizedCountryCode = countryCode?.trim().toUpperCase();
  const value = postalCode?.trim() ?? "";

  if (!value) {
    return "";
  }

  switch (normalizedCountryCode) {
    case "PT": {
      const digits = value.replace(/\D/g, "");

      if (digits.length === 7) {
        return `${digits.slice(0, 4)}-${digits.slice(4)}`;
      }

      return value;
    }

    case "BR": {
      const digits = value.replace(/\D/g, "");

      if (digits.length === 8) {
        return `${digits.slice(0, 5)}-${digits.slice(5)}`;
      }

      return value;
    }

    case "CA": {
      const compact = value.replace(/\s/g, "").toUpperCase();

      if (compact.length === 6) {
        return `${compact.slice(0, 3)} ${compact.slice(3)}`;
      }

      return value.toUpperCase();
    }

    case "GB": {
      const compact = value.replace(/\s/g, "").toUpperCase();

      if (compact.length >= 5 && compact.length <= 7) {
        return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
      }

      return value.toUpperCase().replace(/\s+/g, " ");
    }

    case "IE":
    case "MT":
      return value.toUpperCase().replace(/\s+/g, " ");

    case "NL": {
      const compact = value.replace(/\s/g, "").toUpperCase();

      if (compact.length === 6) {
        return `${compact.slice(0, 4)} ${compact.slice(4)}`;
      }

      return value.toUpperCase();
    }

    default:
      return value;
  }
}
