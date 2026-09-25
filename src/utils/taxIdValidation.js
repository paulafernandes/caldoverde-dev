export function normalizeTaxId(countryCode, taxId) {
  const normalizedCountryCode = countryCode?.trim().toUpperCase();
  const value = taxId?.trim() ?? "";

  if (!value) {
    return "";
  }

  if (normalizedCountryCode === "PT") {
    return value.replace(/\s/g, "");
  }

  if (normalizedCountryCode === "ES") {
    return value.replace(/\s/g, "").toUpperCase();
  }

  return value;
}

export function isValidTaxId(countryCode, taxId) {
  const normalizedCountryCode = countryCode?.trim().toUpperCase();
  const value = normalizeTaxId(normalizedCountryCode, taxId);

  if (!value) {
    return false;
  }

  switch (normalizedCountryCode) {
    case "PT":
      return /^\d{9}$/.test(value);

    case "ES":
      return (
        /^\d{8}[A-Z]$/.test(value) ||
        /^[XYZ]\d{7}[A-Z]$/.test(value) ||
        /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(value)
      );

    default:
      return true;
  }
}

const TAX_ID_EXAMPLES = {
  PT: "123456789",
  ES: "12345678Z",
  GB: "GB123456789",
};

export function getTaxIdExample(countryCode) {
  const normalizedCountryCode = countryCode?.trim().toUpperCase();

  return TAX_ID_EXAMPLES[normalizedCountryCode] ?? "";
}
