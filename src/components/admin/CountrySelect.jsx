import { useMemo } from "react";

import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { COUNTRY_CODES } from "../../data/countries";

function getCountryCodeFromLocale(locale) {
  if (!locale) {
    return null;
  }

  const parts = locale.replace("_", "-").split("-");

  if (parts.length < 2) {
    return null;
  }

  const countryCode = parts[parts.length - 1].toUpperCase();

  return /^[A-Z]{2}$/.test(countryCode) ? countryCode : null;
}

export default function CountrySelect({
  id,
  name,
  value,
  languages,
  disabled = false,
  required = false,
  onChange,
  onBlur,
}) {
  const { language, t } = useAdminLanguage();

  const displayNames = useMemo(
    () =>
      new Intl.DisplayNames([language], {
        type: "region",
      }),
    [language]
  );

  const priorityCountryCodes = useMemo(() => {
    const codes = languages
      .filter((businessLanguage) => businessLanguage.isEnabled)
      .map((businessLanguage) =>
        getCountryCodeFromLocale(businessLanguage.locale)
      )
      .filter(Boolean);

    return [...new Set(codes)];
  }, [languages]);

  const otherCountryCodes = useMemo(() => {
    const codes = [...COUNTRY_CODES];

    if (value && !codes.includes(value)) {
      codes.push(value);
    }

    return codes
      .filter((countryCode) => !priorityCountryCodes.includes(countryCode))
      .sort((first, second) =>
        displayNames.of(first).localeCompare(displayNames.of(second), language)
      );
  }, [displayNames, language, priorityCountryCodes, value]);

  return (
    <select
      id={id}
      name={name}
      value={value}
      required={required}
      disabled={disabled}
      onChange={onChange}
      onBlur={onBlur}
    >
      <option value="">{t("settings.selectCountry")}</option>

      {priorityCountryCodes.length > 0 && (
        <optgroup label={t("settings.languageCountries")}>
          {priorityCountryCodes.map((countryCode) => (
            <option key={countryCode} value={countryCode}>
              {displayNames.of(countryCode)}
            </option>
          ))}
        </optgroup>
      )}

      <optgroup label={t("settings.otherCountries")}>
        {otherCountryCodes.map((countryCode) => (
          <option key={countryCode} value={countryCode}>
            {displayNames.of(countryCode)}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
