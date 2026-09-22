import Head from "next/head";
import { useEffect, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { getBusinessSettings } from "../../server/businessSettingsService";
import { getAdminSession } from "../../server/getAdminSession";
import { authClient } from "../../lib/authClient";
import CountrySelect from "../../components/admin/CountrySelect";
import AdministrativeAreaSelect from "../../components/admin/AdministrativeAreaSelect";
import { getAdministrativeAreaConfig } from "../../data/administrativeAreas";
import {
  getPostalCodeExample,
  isValidPostalCode,
  normalizePostalCode,
} from "../../utils/postalCodeValidation";
import isEmail from "validator/lib/isEmail.js";
import {
  getTaxIdExample,
  isValidTaxId,
  normalizeTaxId,
} from "../../utils/taxIdValidation";
import PhoneInput from "../../components/admin/PhoneInput";
import {
  isValidPhoneForCountry,
  parseStoredPhoneNumber,
  toE164PhoneNumber,
} from "../../utils/phoneValidation";
import styles from "../../styles/Admin.module.css";

export default function AdminSettings({ admin, businessSettings }) {
  const { language, t } = useAdminLanguage();

  const initialPhone = parseStoredPhoneNumber(
    businessSettings.phone,
    businessSettings.countryCode
  );

  const initialMobilePhone = parseStoredPhoneNumber(
    businessSettings.mobilePhone,
    businessSettings.countryCode
  );

  const [formValues, setFormValues] = useState({
    name: businessSettings.name ?? "",
    email: businessSettings.email ?? "",
    phone: initialPhone.nationalNumber,
    mobilePhone: initialMobilePhone.nationalNumber,
    addressLine1: businessSettings.addressLine1 ?? "",
    addressLine2: businessSettings.addressLine2 ?? "",
    postalCode: businessSettings.postalCode ?? "",
    city: businessSettings.city ?? "",
    countryCode: businessSettings.countryCode ?? "",
    administrativeAreaCode: businessSettings.administrativeAreaCode ?? "",
    taxId: businessSettings.taxId ?? "",
    fiscalAddressSameAsBusiness:
      businessSettings.fiscalAddressSameAsBusiness ?? true,
    fiscalAddressLine1: businessSettings.fiscalAddressLine1 ?? "",
    fiscalAddressLine2: businessSettings.fiscalAddressLine2 ?? "",
    fiscalPostalCode: businessSettings.fiscalPostalCode ?? "",
    fiscalCity: businessSettings.fiscalCity ?? "",
    fiscalCountryCode: businessSettings.fiscalCountryCode ?? "",
    fiscalAdministrativeAreaCode:
      businessSettings.fiscalAdministrativeAreaCode ?? "",
    primaryActionUrl: businessSettings.primaryActionUrl ?? "",
  });

  const [phoneCountryCode, setPhoneCountryCode] = useState(
    initialPhone.countryCode
  );

  const [mobilePhoneCountryCode, setMobilePhoneCountryCode] = useState(
    initialMobilePhone.countryCode
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const [reauthEmail, setReauthEmail] = useState(admin.email);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [showReauthForm, setShowReauthForm] = useState(false);

  useEffect(() => {
    function handleSessionExpired() {
      setIsSessionExpired(true);
      setError("");
      setSuccess("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.addEventListener("admin-session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("admin-session-expired", handleSessionExpired);
    };
  }, []);

  function getFieldErrorMessage(field, code) {
    const fieldErrorMessages = {
      name: {
        BUSINESS_NAME_REQUIRED: "settings.nameRequired",
        BUSINESS_NAME_TOO_LONG: "settings.nameTooLong",
      },
      email: {
        EMAIL_REQUIRED: "settings.emailRequired",
        INVALID_EMAIL: "settings.invalidEmail",
        EMAIL_TOO_LONG: "settings.emailTooLong",
      },
      phone: {
        PHONE_CONTACT_REQUIRED: "settings.phoneContactRequired",
        PHONE_TOO_LONG: "settings.phoneTooLong",
      },
      mobilePhone: {
        MOBILE_PHONE_TOO_LONG: "settings.mobilePhoneTooLong",
      },
      addressLine1: {
        ADDRESS_REQUIRED: "settings.addressRequired",
        ADDRESS_TOO_LONG: "settings.addressLine1TooLong",
      },
      postalCode: {
        POSTAL_CODE_REQUIRED: "settings.postalCodeRequired",
        POSTAL_CODE_TOO_LONG: "settings.postalCodeTooLong",
        INVALID_POSTAL_CODE: "settings.invalidPostalCode",
      },
      city: {
        CITY_REQUIRED: "settings.cityRequired",
        CITY_TOO_LONG: "settings.cityTooLong",
      },
      countryCode: {
        COUNTRY_REQUIRED: "settings.countryRequired",
        INVALID_COUNTRY_CODE: "settings.invalidCountryCode",
      },
      addressLine2: {
        ADDRESS_TOO_LONG: "settings.addressLine2TooLong",
      },
      primaryActionUrl: {
        INVALID_URL: "settings.invalidUrl",
        URL_TOO_LONG: "settings.urlTooLong",
      },
      taxId: {
        TAX_ID_REQUIRED: "settings.taxIdRequired",
        TAX_ID_TOO_LONG: "settings.taxIdTooLong",
      },
      fiscalAddressLine1: {
        FISCAL_ADDRESS_REQUIRED: "settings.fiscalAddressRequired",
        FISCAL_ADDRESS_TOO_LONG: "settings.fiscalAddressTooLong",
      },
      fiscalAddressLine2: {
        FISCAL_ADDRESS_TOO_LONG: "settings.fiscalAddressLine2TooLong",
      },
      fiscalPostalCode: {
        FISCAL_POSTAL_CODE_REQUIRED: "settings.fiscalPostalCodeRequired",
        FISCAL_POSTAL_CODE_TOO_LONG: "settings.fiscalPostalCodeTooLong",
      },
      fiscalPostalCode: {
        FISCAL_POSTAL_CODE_REQUIRED: "settings.fiscalPostalCodeRequired",
        FISCAL_POSTAL_CODE_TOO_LONG: "settings.fiscalPostalCodeTooLong",
        INVALID_FISCAL_POSTAL_CODE: "settings.invalidFiscalPostalCode",
      },
      fiscalCity: {
        FISCAL_CITY_REQUIRED: "settings.fiscalCityRequired",
        FISCAL_CITY_TOO_LONG: "settings.fiscalCityTooLong",
      },
      fiscalCountryCode: {
        FISCAL_COUNTRY_REQUIRED: "settings.fiscalCountryRequired",
        INVALID_FISCAL_COUNTRY_CODE: "settings.invalidFiscalCountryCode",
      },
      administrativeAreaCode: {
        ADMINISTRATIVE_AREA_REQUIRED: "settings.administrativeAreaRequired",
        INVALID_ADMINISTRATIVE_AREA: "settings.invalidAdministrativeArea",
      },
      phone: {
        PHONE_CONTACT_REQUIRED: "settings.phoneContactRequired",
        PHONE_TOO_LONG: "settings.phoneTooLong",
        INVALID_PHONE_FORMAT: "settings.phoneDigitsOnly",
      },

      mobilePhone: {
        MOBILE_PHONE_TOO_LONG: "settings.mobilePhoneTooLong",
        INVALID_MOBILE_PHONE_FORMAT: "settings.mobilePhoneDigitsOnly",
      },
      taxId: {
        TAX_ID_REQUIRED: "settings.taxIdRequired",
        TAX_ID_TOO_LONG: "settings.taxIdTooLong",
        INVALID_TAX_ID: "settings.invalidTaxId",
      },
      fiscalAdministrativeAreaCode: {
        FISCAL_ADMINISTRATIVE_AREA_REQUIRED:
          "settings.fiscalAdministrativeAreaRequired",
        INVALID_FISCAL_ADMINISTRATIVE_AREA:
          "settings.invalidFiscalAdministrativeArea",
      },
      phone: {
        PHONE_CONTACT_REQUIRED: "settings.phoneContactRequired",
        PHONE_TOO_LONG: "settings.phoneTooLong",
        INVALID_PHONE_FORMAT: "settings.phoneDigitsOnly",
        PHONE_TOO_SHORT: "settings.phoneTooShort",
      },

      mobilePhone: {
        MOBILE_PHONE_TOO_LONG: "settings.mobilePhoneTooLong",
        INVALID_MOBILE_PHONE_FORMAT: "settings.mobilePhoneDigitsOnly",
        MOBILE_PHONE_TOO_SHORT: "settings.mobilePhoneTooShort",
      },
      phone: {
        PHONE_CONTACT_REQUIRED: "settings.phoneContactRequired",
        PHONE_TOO_LONG: "settings.phoneTooLong",
        INVALID_PHONE_FORMAT: "settings.phoneDigitsOnly",
        PHONE_TOO_SHORT: "settings.phoneTooShort",
        INVALID_PHONE_NUMBER: "settings.invalidPhoneNumber",
      },

      mobilePhone: {
        MOBILE_PHONE_TOO_LONG: "settings.mobilePhoneTooLong",
        INVALID_MOBILE_PHONE_FORMAT: "settings.mobilePhoneDigitsOnly",
        MOBILE_PHONE_TOO_SHORT: "settings.mobilePhoneTooShort",
        INVALID_MOBILE_PHONE_NUMBER: "settings.invalidMobilePhoneNumber",
      },
    };

    return fieldErrorMessages[field]?.[code] ?? null;
  }

  function getCountryName(countryCode) {
    if (!countryCode) {
      return "";
    }

    const displayNames = new Intl.DisplayNames([language], {
      type: "region",
    });

    return displayNames.of(countryCode) ?? countryCode;
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((current) => {
      const next = {
        ...current,
        [name]: "",
      };

      if (name === "phone" || name === "mobilePhone") {
        next.phone = "";
        next.mobilePhone = "";
      }

      return next;
    });

    setError("");
    setSuccess("");
  }

  function getTaxCountryCode() {
    return formValues.fiscalAddressSameAsBusiness
      ? formValues.countryCode
      : formValues.fiscalCountryCode;
  }

  function handleTaxIdBlur(event) {
    const value = event.target.value;
    const countryCode = formValues.countryCode;

    const normalizedValue = normalizeTaxId(countryCode, value);

    let errorCode = "";

    if (!normalizedValue) {
      errorCode = "TAX_ID_REQUIRED";
    } else if (normalizedValue.length > 50) {
      errorCode = "TAX_ID_TOO_LONG";
    } else if (countryCode && !isValidTaxId(countryCode, normalizedValue)) {
      errorCode = "INVALID_TAX_ID";
    }

    setFormValues((current) => ({
      ...current,
      taxId: normalizedValue,
    }));

    setFieldErrors((current) => ({
      ...current,
      taxId: errorCode,
    }));
  }

  function getRequiredCountryError(fieldName) {
    return fieldName === "fiscalCountryCode"
      ? "FISCAL_COUNTRY_REQUIRED"
      : "COUNTRY_REQUIRED";
  }

  function handleCountryChange(event) {
    const { name, value } = event.target;

    const isFiscal = name === "fiscalCountryCode";

    const administrativeAreaField = isFiscal
      ? "fiscalAdministrativeAreaCode"
      : "administrativeAreaCode";

    const postalCodeField = isFiscal ? "fiscalPostalCode" : "postalCode";

    const postalCodeValue = isFiscal
      ? formValues.fiscalPostalCode
      : formValues.postalCode;

    setFormValues((current) => ({
      ...current,
      [name]: value,
      [administrativeAreaField]: "",
    }));

    setFieldErrors((current) => ({
      ...current,

      [name]: value ? "" : getRequiredCountryError(name),

      [administrativeAreaField]: "",

      [postalCodeField]:
        value && postalCodeValue.trim()
          ? getPostalCodeError(postalCodeField, value, postalCodeValue)
          : "",
      ...(!isFiscal && formValues.taxId.trim()
        ? {
            taxId:
              value && !isValidTaxId(value, formValues.taxId)
                ? "INVALID_TAX_ID"
                : "",
          }
        : {}),
    }));

    setError("");
    setSuccess("");
  }

  function handlePhoneBlur(event) {
    const { name, value } = event.target;
    const normalizedValue = value.trim();

    const countryCode =
      name === "mobilePhone" ? mobilePhoneCountryCode : phoneCountryCode;

    let errorCode = "";

    if (
      normalizedValue &&
      !isValidPhoneForCountry(countryCode, normalizedValue)
    ) {
      errorCode =
        name === "mobilePhone"
          ? "INVALID_MOBILE_PHONE_NUMBER"
          : "INVALID_PHONE_NUMBER";
    }

    setFieldErrors((current) => ({
      ...current,
      [name]: errorCode,
    }));
  }

  function handleMobilePhoneCountryChange(countryCode) {
    setMobilePhoneCountryCode(countryCode);

    setFieldErrors((current) => ({
      ...current,
      mobilePhone: "",
    }));

    setError("");
    setSuccess("");
  }

  function handlePhoneCountryChange(countryCode) {
    setPhoneCountryCode(countryCode);

    setFieldErrors((current) => ({
      ...current,
      phone: "",
    }));

    setError("");
    setSuccess("");
  }

  function handlePhoneChange(event) {
    const { name, value } = event.target;

    const digitsOnly = value.replace(/\D/g, "");

    setFormValues((current) => ({
      ...current,
      [name]: digitsOnly,
    }));

    setFieldErrors((current) => ({
      ...current,
      phone: "",
      mobilePhone: "",
    }));

    setError("");
    setSuccess("");
  }

  function handleCountryBlur(event) {
    const { name, value } = event.target;

    if (value) {
      return;
    }

    setFieldErrors((current) => ({
      ...current,
      [name]: getRequiredCountryError(name),
    }));
  }

  function handleEmailBlur(event) {
    const value = event.target.value.trim();

    let errorCode = "";

    if (!value) {
      errorCode = "EMAIL_REQUIRED";
    } else if (value.length > 254) {
      errorCode = "EMAIL_TOO_LONG";
    } else if (!isEmail(value)) {
      errorCode = "INVALID_EMAIL";
    }

    setFormValues((current) => ({
      ...current,
      email: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      email: errorCode,
    }));
  }

  function getPostalCodeError(fieldName, countryCode, postalCode) {
    const isFiscal = fieldName === "fiscalPostalCode";

    if (!postalCode.trim()) {
      return isFiscal ? "FISCAL_POSTAL_CODE_REQUIRED" : "POSTAL_CODE_REQUIRED";
    }

    if (countryCode && !isValidPostalCode(countryCode, postalCode)) {
      return isFiscal ? "INVALID_FISCAL_POSTAL_CODE" : "INVALID_POSTAL_CODE";
    }

    return "";
  }

  function handlePostalCodeBlur(event) {
    const { name, value } = event.target;

    const countryCode =
      name === "fiscalPostalCode"
        ? formValues.fiscalCountryCode
        : formValues.countryCode;

    const normalizedValue = normalizePostalCode(countryCode, value);

    setFormValues((current) => ({
      ...current,
      [name]: normalizedValue,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: getPostalCodeError(name, countryCode, normalizedValue),
    }));
  }

  function getRequiredAdministrativeAreaError(fieldName) {
    return fieldName === "fiscalAdministrativeAreaCode"
      ? "FISCAL_ADMINISTRATIVE_AREA_REQUIRED"
      : "ADMINISTRATIVE_AREA_REQUIRED";
  }

  function handleAdministrativeAreaChange(event) {
    const { name, value } = event.target;

    handleChange(event);

    setFieldErrors((current) => ({
      ...current,
      [name]: value ? "" : getRequiredAdministrativeAreaError(name),
    }));
  }

  function handleAdministrativeAreaBlur(event) {
    const { name, value } = event.target;

    if (value) {
      return;
    }

    setFieldErrors((current) => ({
      ...current,
      [name]: getRequiredAdministrativeAreaError(name),
    }));
  }

  function handleCancel() {
    const resetPhone = parseStoredPhoneNumber(
      businessSettings.phone,
      businessSettings.countryCode
    );

    const resetMobilePhone = parseStoredPhoneNumber(
      businessSettings.mobilePhone,
      businessSettings.countryCode
    );
    setFormValues({
      name: businessSettings.name ?? "",
      email: businessSettings.email ?? "",
      phone: resetPhone.nationalNumber,
      mobilePhone: resetMobilePhone.nationalNumber,
      addressLine1: businessSettings.addressLine1 ?? "",
      addressLine2: businessSettings.addressLine2 ?? "",
      postalCode: businessSettings.postalCode ?? "",
      city: businessSettings.city ?? "",
      countryCode: businessSettings.countryCode ?? "",
      administrativeAreaCode: businessSettings.administrativeAreaCode ?? "",
      taxId: businessSettings.taxId ?? "",
      fiscalAddressSameAsBusiness:
        businessSettings.fiscalAddressSameAsBusiness ?? true,
      fiscalAddressLine1: businessSettings.fiscalAddressLine1 ?? "",
      fiscalAddressLine2: businessSettings.fiscalAddressLine2 ?? "",
      fiscalPostalCode: businessSettings.fiscalPostalCode ?? "",
      fiscalCity: businessSettings.fiscalCity ?? "",
      fiscalCountryCode: businessSettings.fiscalCountryCode ?? "",
      fiscalAdministrativeAreaCode:
        businessSettings.fiscalAdministrativeAreaCode ?? "",
      primaryActionUrl: businessSettings.primaryActionUrl ?? "",
    });
    setPhoneCountryCode(resetPhone.countryCode);
    setMobilePhoneCountryCode(resetMobilePhone.countryCode);
    setError("");
    setSuccess("");
    setFieldErrors({});
  }

  async function handleReauthenticate(event) {
    event.preventDefault();

    setReauthError("");
    setIsReauthenticating(true);

    const { error: signInError } = await authClient.signIn.email({
      email: reauthEmail.trim(),
      password: reauthPassword,
    });

    if (signInError) {
      setReauthError("session.signInFailed");
      setIsReauthenticating(false);
      return;
    }

    setIsSessionExpired(false);
    setShowReauthForm(false);
    setReauthPassword("");
    setReauthError("");
    setIsReauthenticating(false);
  }

  function scrollToFirstFieldError(errors) {
    const errorFields = new Set(
      Object.keys(errors).filter((field) => errors[field])
    );

    if (errorFields.size === 0) {
      return;
    }

    requestAnimationFrame(() => {
      const form = document.getElementById("business-settings-form");

      if (!form) {
        return;
      }

      const firstInvalidField = Array.from(
        form.querySelectorAll("[name]")
      ).find((element) => errorFields.has(element.name));

      if (!firstInvalidField) {
        return;
      }

      firstInvalidField.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      firstInvalidField.focus({
        preventScroll: true,
      });
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!formValues.name.trim()) {
      const nextFieldErrors = {
        name: "BUSINESS_NAME_REQUIRED",
      };

      setFieldErrors(nextFieldErrors);
      scrollToFirstFieldError(nextFieldErrors);

      return;
    }

    const phoneErrors = {};

    if (
      formValues.phone.trim() &&
      !isValidPhoneForCountry(phoneCountryCode, formValues.phone)
    ) {
      phoneErrors.phone = "INVALID_PHONE_NUMBER";
    }

    if (
      formValues.mobilePhone.trim() &&
      !isValidPhoneForCountry(mobilePhoneCountryCode, formValues.mobilePhone)
    ) {
      phoneErrors.mobilePhone = "INVALID_MOBILE_PHONE_NUMBER";
    }

    if (!formValues.phone.trim() && !formValues.mobilePhone.trim()) {
      phoneErrors.phone = "PHONE_CONTACT_REQUIRED";
    }

    if (Object.keys(phoneErrors).length > 0) {
      setFieldErrors(phoneErrors);
      scrollToFirstFieldError(phoneErrors);
      return;
    }

    const phoneE164 = formValues.phone.trim()
      ? toE164PhoneNumber(phoneCountryCode, formValues.phone)
      : null;

    const mobilePhoneE164 = formValues.mobilePhone.trim()
      ? toE164PhoneNumber(mobilePhoneCountryCode, formValues.mobilePhone)
      : null;

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/business/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formValues.name.trim(),

          // Ainda não são editáveis nesta página,
          // mas o schema exige estes campos.
          logoPath: businessSettings.logoPath ?? null,
          faviconPath: businessSettings.faviconPath ?? null,

          email: formValues.email.trim(),
          phone: phoneE164,
          mobilePhone: mobilePhoneE164,
          addressLine1: formValues.addressLine1.trim(),
          addressLine2: formValues.addressLine2.trim() || null,
          postalCode: formValues.postalCode.trim(),
          city: formValues.city.trim(),
          countryCode: formValues.countryCode.trim(),
          administrativeAreaCode:
            formValues.administrativeAreaCode.trim() || null,
          taxId: formValues.taxId.trim(),
          fiscalAddressSameAsBusiness: formValues.fiscalAddressSameAsBusiness,
          fiscalAddressLine1: formValues.fiscalAddressLine1.trim() || null,
          fiscalAddressLine2: formValues.fiscalAddressLine2.trim() || null,
          fiscalPostalCode: formValues.fiscalPostalCode.trim() || null,
          fiscalCity: formValues.fiscalCity.trim() || null,
          fiscalCountryCode: formValues.fiscalCountryCode.trim() || null,
          fiscalAdministrativeAreaCode:
            formValues.fiscalAdministrativeAreaCode.trim() || null,
          primaryActionUrl: formValues.primaryActionUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.dispatchEvent(new Event("admin-session-expired"));

        return;
      }

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.error === "INVALID_BUSINESS_SETTINGS_DATA" &&
          Array.isArray(data.details)
        ) {
          const nextFieldErrors = {};

          for (const detail of data.details) {
            if (detail.field && !nextFieldErrors[detail.field]) {
              nextFieldErrors[detail.field] = detail.code;
            }
          }

          setFieldErrors(nextFieldErrors);
          scrollToFirstFieldError(nextFieldErrors);

          return;
        }

        throw new Error(data.error ?? "BUSINESS_SETTINGS_UPDATE_FAILED");
      }

      const savedPhone = parseStoredPhoneNumber(
        data.settings.phone,
        data.settings.countryCode
      );

      const savedMobilePhone = parseStoredPhoneNumber(
        data.settings.mobilePhone,
        data.settings.countryCode
      );

      setFormValues({
        name: data.settings.name ?? "",
        email: data.settings.email ?? "",
        phone: savedPhone.nationalNumber,
        mobilePhone: savedMobilePhone.nationalNumber,
        addressLine1: data.settings.addressLine1 ?? "",
        addressLine2: data.settings.addressLine2 ?? "",
        postalCode: data.settings.postalCode ?? "",
        city: data.settings.city ?? "",
        countryCode: data.settings.countryCode ?? "",
        administrativeAreaCode: data.settings.administrativeAreaCode ?? "",
        taxId: data.settings.taxId ?? "",
        fiscalAddressSameAsBusiness:
          data.settings.fiscalAddressSameAsBusiness ?? true,
        fiscalAddressLine1: data.settings.fiscalAddressLine1 ?? "",
        fiscalAddressLine2: data.settings.fiscalAddressLine2 ?? "",
        fiscalPostalCode: data.settings.fiscalPostalCode ?? "",
        fiscalCity: data.settings.fiscalCity ?? "",
        fiscalCountryCode: data.settings.fiscalCountryCode ?? "",
        fiscalAdministrativeAreaCode:
          data.settings.fiscalAdministrativeAreaCode ?? "",
        primaryActionUrl: data.settings.primaryActionUrl ?? "",
      });

      setPhoneCountryCode(savedPhone.countryCode);
      setMobilePhoneCountryCode(savedMobilePhone.countryCode);

      setSuccess("settings.saveSuccess");
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    } catch {
      setError("settings.saveFailed");
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <>
      <Head>
        <title>{t("settings.pageTitle")}</title>

        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout admin={admin}>
        <section className={styles.dashboardHeading}>
          <div>
            <h1>{t("settings.title")}</h1>

            <p>{t("settings.subtitle")}</p>
          </div>
        </section>
        {success && (
          <p
            className={`${styles.successMessage} ${styles.formMessage}`}
            role="status"
          >
            {t(success)}
          </p>
        )}
        {isSessionExpired && (
          <div className={styles.sessionExpiredNotice} role="alert">
            <strong>{t("session.expiredTitle")}</strong>

            <p>{t("session.expiredDescription")}</p>

            {!showReauthForm ? (
              <button
                className={styles.saveButton}
                type="button"
                onClick={() => setShowReauthForm(true)}
              >
                {t("session.reauthenticate")}
              </button>
            ) : (
              <form
                className={styles.reauthForm}
                onSubmit={handleReauthenticate}
                noValidate
              >
                <label>
                  <span>{t("session.email")}</span>

                  <input
                    className={styles.editorInput}
                    type="email"
                    autoComplete="username"
                    required
                    disabled={isReauthenticating}
                    value={reauthEmail}
                    onChange={(event) => setReauthEmail(event.target.value)}
                  />
                </label>

                <label>
                  <span>{t("session.password")}</span>

                  <input
                    className={styles.editorInput}
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={isReauthenticating}
                    value={reauthPassword}
                    onChange={(event) => setReauthPassword(event.target.value)}
                  />
                </label>

                {reauthError && (
                  <p className={styles.errorMessage}>{t(reauthError)}</p>
                )}

                <div className={styles.reauthActions}>
                  <button
                    className={styles.cancelButton}
                    type="button"
                    disabled={isReauthenticating}
                    onClick={() => {
                      setShowReauthForm(false);
                      setReauthPassword("");
                      setReauthError("");
                    }}
                  >
                    {t("session.cancel")}
                  </button>

                  <button
                    className={styles.saveButton}
                    type="submit"
                    disabled={isReauthenticating}
                  >
                    {isReauthenticating
                      ? t("session.signingIn")
                      : t("session.signIn")}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        <section
          className={`${styles.userFormCard} ${styles.settingsFormCard}`}
        >
          <h2>{t("settings.generalData")}</h2>

          <form
            id="business-settings-form"
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className={styles.settingsFormColumns}>
              <div className={styles.settingsFormColumn}>
                <div className={styles.field}>
                  <label htmlFor="business-name">{t("settings.name")}</label>

                  <input
                    id="business-name"
                    name="name"
                    type="text"
                    value={formValues.name}
                    required
                    disabled={isSaving}
                    onChange={handleChange}
                  />
                  {fieldErrors.name &&
                    getFieldErrorMessage("name", fieldErrors.name) && (
                      <p className={styles.error} role="alert">
                        {t(getFieldErrorMessage("name", fieldErrors.name))}
                      </p>
                    )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="business-tax-id">{t("settings.taxId")}</label>

                  <input
                    id="business-tax-id"
                    name="taxId"
                    type="text"
                    required
                    value={formValues.taxId}
                    disabled={isSaving}
                    onChange={handleChange}
                    onBlur={handleTaxIdBlur}
                    placeholder={getTaxIdExample(formValues.countryCode)}
                  />

                  {fieldErrors.taxId &&
                    getFieldErrorMessage("taxId", fieldErrors.taxId) && (
                      <p className={styles.error} role="alert">
                        {t(getFieldErrorMessage("taxId", fieldErrors.taxId))}
                      </p>
                    )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="business-email">{t("settings.email")}</label>

                  <input
                    id="business-email"
                    name="email"
                    type="email"
                    required
                    value={formValues.email}
                    disabled={isSaving}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                  />
                  {fieldErrors.email && (
                    <p className={styles.error} role="alert">
                      {t(getFieldErrorMessage("email", fieldErrors.email))}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="business-phone">{t("settings.phone")}</label>

                  <PhoneInput
                    id="business-phone"
                    name="phone"
                    value={formValues.phone}
                    countryCode={phoneCountryCode}
                    disabled={isSaving}
                    onCountryChange={handlePhoneCountryChange}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                  />
                  {fieldErrors.phone && (
                    <p className={styles.error} role="alert">
                      {t(getFieldErrorMessage("phone", fieldErrors.phone))}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="business-mobile-phone">
                    {t("settings.mobilePhone")}
                  </label>

                  <PhoneInput
                    id="business-mobile-phone"
                    name="mobilePhone"
                    value={formValues.mobilePhone}
                    countryCode={mobilePhoneCountryCode}
                    disabled={isSaving}
                    onCountryChange={handleMobilePhoneCountryChange}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                  />

                  {fieldErrors.mobilePhone &&
                    getFieldErrorMessage(
                      "mobilePhone",
                      fieldErrors.mobilePhone
                    ) && (
                      <p className={styles.error} role="alert">
                        {t(
                          getFieldErrorMessage(
                            "mobilePhone",
                            fieldErrors.mobilePhone
                          )
                        )}
                      </p>
                    )}
                </div>
              </div>

              <div className={styles.settingsFormColumn}>
                <div className={styles.field}>
                  <label htmlFor="business-address-line-1">
                    {t("settings.addressLine1")}
                  </label>

                  <input
                    id="business-address-line-1"
                    name="addressLine1"
                    type="text"
                    required
                    value={formValues.addressLine1}
                    disabled={isSaving}
                    onChange={handleChange}
                  />
                  {fieldErrors.addressLine1 && (
                    <p className={styles.error} role="alert">
                      {t(
                        getFieldErrorMessage(
                          "addressLine1",
                          fieldErrors.addressLine1
                        )
                      )}
                    </p>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="business-address-line-2">
                    {t("settings.addressLine2")}
                  </label>

                  <input
                    id="business-address-line-2"
                    name="addressLine2"
                    type="text"
                    value={formValues.addressLine2}
                    disabled={isSaving}
                    onChange={handleChange}
                  />
                  {fieldErrors.addressLine2 &&
                    getFieldErrorMessage(
                      "addressLine2",
                      fieldErrors.addressLine2
                    ) && (
                      <p className={styles.error} role="alert">
                        {t(
                          getFieldErrorMessage(
                            "addressLine2",
                            fieldErrors.addressLine2
                          )
                        )}
                      </p>
                    )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="business-country">
                    {t("settings.countryCode")}
                  </label>

                  <CountrySelect
                    id="business-country"
                    name="countryCode"
                    value={formValues.countryCode}
                    languages={businessSettings.languages}
                    required
                    disabled={isSaving}
                    onChange={handleCountryChange}
                    onBlur={handleCountryBlur}
                  />
                  {getAdministrativeAreaConfig(formValues.countryCode) && (
                    <div className={styles.field}>
                      <AdministrativeAreaSelect
                        id="business-administrative-area"
                        name="administrativeAreaCode"
                        countryCode={formValues.countryCode}
                        value={formValues.administrativeAreaCode}
                        required
                        disabled={isSaving}
                        onChange={handleAdministrativeAreaChange}
                        onBlur={handleAdministrativeAreaBlur}
                      />

                      {fieldErrors.administrativeAreaCode &&
                        getFieldErrorMessage(
                          "administrativeAreaCode",
                          fieldErrors.administrativeAreaCode
                        ) && (
                          <p className={styles.error} role="alert">
                            {t(
                              getFieldErrorMessage(
                                "administrativeAreaCode",
                                fieldErrors.administrativeAreaCode
                              )
                            )}
                          </p>
                        )}
                    </div>
                  )}
                  {fieldErrors.countryCode && (
                    <p className={styles.error} role="alert">
                      {t(
                        getFieldErrorMessage(
                          "countryCode",
                          fieldErrors.countryCode
                        )
                      )}
                    </p>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="business-city">{t("settings.city")}</label>
                  <input
                    id="business-city"
                    name="city"
                    type="text"
                    required
                    value={formValues.city}
                    disabled={isSaving}
                    onChange={handleChange}
                  />
                  {fieldErrors.city && (
                    <p className={styles.error} role="alert">
                      {t(getFieldErrorMessage("city", fieldErrors.city))}
                    </p>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="business-postal-code">
                    {t("settings.postalCode")}
                  </label>

                  <input
                    id="business-postal-code"
                    name="postalCode"
                    type="text"
                    value={formValues.postalCode}
                    placeholder={getPostalCodeExample(formValues.countryCode)}
                    autoComplete="postal-code"
                    disabled={isSaving}
                    required
                    onBlur={handlePostalCodeBlur}
                    onChange={handleChange}
                  />
                  {fieldErrors.postalCode && (
                    <p className={styles.error} role="alert">
                      {t(
                        getFieldErrorMessage(
                          "postalCode",
                          fieldErrors.postalCode
                        ),
                        {
                          country: getCountryName(formValues.countryCode),
                        }
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.settingsFiscalSection}>
              <h3>{t("settings.fiscalData")}</h3>

              <label className={styles.settingsCheckbox}>
                <input
                  name="fiscalAddressSameAsBusiness"
                  type="checkbox"
                  checked={formValues.fiscalAddressSameAsBusiness}
                  disabled={isSaving}
                  onChange={handleChange}
                />

                <span>{t("settings.fiscalAddressSameAsBusiness")}</span>
              </label>

              {!formValues.fiscalAddressSameAsBusiness && (
                <div className={styles.settingsFormColumns}>
                  <div className={styles.settingsFormColumn}>
                    <div className={styles.field}>
                      <label htmlFor="business-fiscal-address">
                        {t("settings.fiscalAddressLine1")}
                      </label>

                      <input
                        id="business-fiscal-address"
                        name="fiscalAddressLine1"
                        type="text"
                        required
                        value={formValues.fiscalAddressLine1}
                        disabled={isSaving}
                        onChange={handleChange}
                      />

                      {fieldErrors.fiscalAddressLine1 &&
                        getFieldErrorMessage(
                          "fiscalAddressLine1",
                          fieldErrors.fiscalAddressLine1
                        ) && (
                          <p className={styles.error} role="alert">
                            {t(
                              getFieldErrorMessage(
                                "fiscalAddressLine1",
                                fieldErrors.fiscalAddressLine1
                              )
                            )}
                          </p>
                        )}
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="business-fiscal-address-2">
                        {t("settings.fiscalAddressLine2")}
                      </label>

                      <input
                        id="business-fiscal-address-2"
                        name="fiscalAddressLine2"
                        type="text"
                        value={formValues.fiscalAddressLine2}
                        disabled={isSaving}
                        onChange={handleChange}
                      />

                      {fieldErrors.fiscalAddressLine2 &&
                        getFieldErrorMessage(
                          "fiscalAddressLine2",
                          fieldErrors.fiscalAddressLine2
                        ) && (
                          <p className={styles.error} role="alert">
                            {t(
                              getFieldErrorMessage(
                                "fiscalAddressLine2",
                                fieldErrors.fiscalAddressLine2
                              )
                            )}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className={styles.settingsFormColumn}>
                    <div className={styles.field}>
                      <label htmlFor="business-fiscal-country">
                        {t("settings.fiscalCountryCode")}
                      </label>

                      <CountrySelect
                        id="business-fiscal-country"
                        name="fiscalCountryCode"
                        value={formValues.fiscalCountryCode}
                        languages={businessSettings.languages}
                        required
                        disabled={isSaving}
                        onChange={handleCountryChange}
                        onBlur={handleCountryBlur}
                      />

                      {getAdministrativeAreaConfig(
                        formValues.fiscalCountryCode
                      ) && (
                        <div className={styles.field}>
                          <AdministrativeAreaSelect
                            id="business-fiscal-administrative-area"
                            name="fiscalAdministrativeAreaCode"
                            countryCode={formValues.fiscalCountryCode}
                            value={formValues.fiscalAdministrativeAreaCode}
                            required
                            disabled={isSaving}
                            onChange={handleAdministrativeAreaChange}
                            onBlur={handleAdministrativeAreaBlur}
                          />

                          {fieldErrors.fiscalAdministrativeAreaCode &&
                            getFieldErrorMessage(
                              "fiscalAdministrativeAreaCode",
                              fieldErrors.fiscalAdministrativeAreaCode
                            ) && (
                              <p className={styles.error} role="alert">
                                {t(
                                  getFieldErrorMessage(
                                    "fiscalAdministrativeAreaCode",
                                    fieldErrors.fiscalAdministrativeAreaCode
                                  )
                                )}
                              </p>
                            )}
                        </div>
                      )}

                      {fieldErrors.fiscalCountryCode && (
                        <p className={styles.error} role="alert">
                          {t(
                            getFieldErrorMessage(
                              "fiscalCountryCode",
                              fieldErrors.fiscalCountryCode
                            )
                          )}
                        </p>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="business-fiscal-city">
                        {t("settings.fiscalCity")}
                      </label>

                      <input
                        id="business-fiscal-city"
                        name="fiscalCity"
                        type="text"
                        required
                        value={formValues.fiscalCity}
                        disabled={isSaving}
                        onChange={handleChange}
                      />

                      {fieldErrors.fiscalCity &&
                        getFieldErrorMessage(
                          "fiscalCity",
                          fieldErrors.fiscalCity
                        ) && (
                          <p className={styles.error} role="alert">
                            {t(
                              getFieldErrorMessage(
                                "fiscalCity",
                                fieldErrors.fiscalCity
                              )
                            )}
                          </p>
                        )}
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="business-fiscal-postal-code">
                        {t("settings.fiscalPostalCode")}
                      </label>

                      <input
                        id="business-fiscal-postal-code"
                        name="fiscalPostalCode"
                        type="text"
                        required
                        value={formValues.fiscalPostalCode}
                        placeholder={getPostalCodeExample(
                          formValues.fiscalCountryCode
                        )}
                        autoComplete="postal-code"
                        onBlur={handlePostalCodeBlur}
                        disabled={isSaving}
                        onChange={handleChange}
                      />

                      {fieldErrors.fiscalPostalCode &&
                        getFieldErrorMessage(
                          "fiscalPostalCode",
                          fieldErrors.fiscalPostalCode
                        ) && (
                          <p className={styles.error} role="alert">
                            {t(
                              getFieldErrorMessage(
                                "fiscalPostalCode",
                                fieldErrors.fiscalPostalCode
                              ),
                              {
                                country: getCountryName(
                                  formValues.fiscalCountryCode
                                ),
                              }
                            )}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.userFormActions}>
              <button
                type="submit"
                className={styles.button}
                disabled={isSaving}
              >
                {isSaving ? t("settings.saving") : t("settings.save")}
              </button>

              <button
                type="button"
                className={styles.editButton}
                disabled={isSaving}
                onClick={handleCancel}
              >
                {t("settings.cancel")}
              </button>
            </div>
            {error && (
              <p className={styles.error} role="alert">
                {t(error)}
              </p>
            )}
          </form>
        </section>
      </AdminLayout>
    </>
  );
}

export async function getServerSideProps({ req }) {
  const session = await getAdminSession(req);

  if (!session) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  const businessSettings = await getBusinessSettings();

  return {
    props: {
      admin: {
        name: session.user.name,
        email: session.user.email,
      },
      businessSettings,
    },
  };
}
