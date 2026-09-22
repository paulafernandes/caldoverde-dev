import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizePhoneInput(value) {
  return value?.replace(/\D/g, "") ?? "";
}

export function isValidPhoneForCountry(countryCode, value) {
  const normalizedValue = normalizePhoneInput(value);

  if (!countryCode || !normalizedValue) {
    return false;
  }

  const phoneNumber = parsePhoneNumberFromString(normalizedValue, countryCode);

  return phoneNumber?.isValid() ?? false;
}

export function toE164PhoneNumber(countryCode, value) {
  const normalizedValue = normalizePhoneInput(value);

  if (!countryCode || !normalizedValue) {
    return null;
  }

  const phoneNumber = parsePhoneNumberFromString(normalizedValue, countryCode);

  if (!phoneNumber?.isValid()) {
    return null;
  }

  return phoneNumber.number;
}

export function parseStoredPhoneNumber(value, fallbackCountryCode) {
  const storedValue = value?.trim();

  if (!storedValue) {
    return {
      countryCode: fallbackCountryCode ?? "",
      nationalNumber: "",
    };
  }

  if (storedValue.startsWith("+")) {
    const phoneNumber = parsePhoneNumberFromString(storedValue);

    if (phoneNumber?.country) {
      return {
        countryCode: phoneNumber.country,
        nationalNumber: normalizePhoneInput(phoneNumber.formatNational()),
      };
    }
  }

  return {
    countryCode: fallbackCountryCode ?? "",
    nationalNumber: normalizePhoneInput(storedValue),
  };
}

export function isValidE164PhoneNumber(value) {
  const normalizedValue = value?.trim();

  if (!normalizedValue || !/^\+[1-9]\d{7,14}$/.test(normalizedValue)) {
    return false;
  }

  const phoneNumber = parsePhoneNumberFromString(normalizedValue);

  return (
    phoneNumber?.isValid() === true && phoneNumber.number === normalizedValue
  );
}
