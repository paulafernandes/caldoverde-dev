import { useEffect, useMemo, useRef, useState } from "react";
import * as Flags from "country-flag-icons/react/3x2";
import { getCountryCallingCode } from "libphonenumber-js";

import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { COUNTRY_CODES } from "../../data/countries";
import { ADMIN_LANGUAGE_OPTIONS } from "../../data/adminTranslations";
import styles from "../../styles/Admin.module.css";

export default function PhoneInput({
  id,
  name,
  value,
  countryCode,
  disabled = false,
  onCountryChange,
  onChange,
  onBlur,
}) {
  const { language, t } = useAdminLanguage();

  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);

  const countryControlRef = useRef(null);

  const displayNames = useMemo(
    () =>
      new Intl.DisplayNames([language], {
        type: "region",
      }),
    [language]
  );

  const countryCodes = useMemo(
    () =>
      [...COUNTRY_CODES].sort((first, second) =>
        displayNames.of(first).localeCompare(displayNames.of(second), language)
      ),
    [displayNames, language]
  );

  const priorityCountryCodes = useMemo(
    () =>
      ADMIN_LANGUAGE_OPTIONS.map(
        ({ countryCode: adminCountryCode }) => adminCountryCode
      ).filter((adminCountryCode) => COUNTRY_CODES.includes(adminCountryCode)),
    []
  );

  const otherCountryCodes = useMemo(
    () =>
      countryCodes.filter(
        (currentCountryCode) =>
          !priorityCountryCodes.includes(currentCountryCode)
      ),
    [countryCodes, priorityCountryCodes]
  );

  useEffect(() => {
    function handlePointerDown(event) {
      if (
        countryControlRef.current &&
        !countryControlRef.current.contains(event.target)
      ) {
        setIsCountryMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsCountryMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const SelectedFlag = countryCode ? Flags[countryCode] : null;

  const selectedCallingCode = countryCode
    ? getCountryCallingCode(countryCode)
    : "";

  function handleCountrySelect(newCountryCode) {
    onCountryChange(newCountryCode);
    setIsCountryMenuOpen(false);
  }
  function renderCountryOption(currentCountryCode) {
    const Flag = Flags[currentCountryCode];

    const callingCode = getCountryCallingCode(currentCountryCode);

    return (
      <button
        key={currentCountryCode}
        type="button"
        role="option"
        aria-selected={currentCountryCode === countryCode}
        className={
          currentCountryCode === countryCode
            ? `${styles.phoneCountryOption} ${styles.phoneCountryOptionSelected}`
            : styles.phoneCountryOption
        }
        onClick={() => handleCountrySelect(currentCountryCode)}
      >
        {Flag && (
          <Flag className={styles.phoneCountryOptionFlag} aria-hidden="true" />
        )}

        <span className={styles.phoneCountryCallingCode}>+{callingCode}</span>

        <span>{displayNames.of(currentCountryCode)}</span>
      </button>
    );
  }
  return (
    <div className={styles.phoneInput}>
      <div ref={countryControlRef} className={styles.phoneCountryControl}>
        <button
          type="button"
          className={styles.phoneCountryButton}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isCountryMenuOpen}
          aria-label={t("settings.phoneCountry")}
          onClick={() => setIsCountryMenuOpen((current) => !current)}
        >
          {SelectedFlag && (
            <SelectedFlag
              className={styles.phoneCountryFlag}
              aria-hidden="true"
            />
          )}

          <span>+{selectedCallingCode}</span>

          <span className={styles.phoneCountryName}>
            {countryCode ? displayNames.of(countryCode) : ""}
          </span>

          <span className={styles.phoneCountryArrow} aria-hidden="true">
            ▾
          </span>
        </button>

        {isCountryMenuOpen && (
          <div
            className={styles.phoneCountryMenu}
            role="listbox"
            aria-label={t("settings.phoneCountry")}
          >
            <div className={styles.phoneCountryGroupLabel}>
              {t("settings.adminLanguageCountries")}
            </div>

            {priorityCountryCodes.map(renderCountryOption)}

            <div className={styles.phoneCountryGroupLabel}>
              {t("settings.otherCountries")}
            </div>

            {otherCountryCodes.map(renderCountryOption)}
          </div>
        )}
      </div>

      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
}
