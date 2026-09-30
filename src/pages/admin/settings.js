import Head from "next/head";
import { useEffect, useRef, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { getBusinessSettings } from "../../server/businessSettingsService";
import { getAdminSession } from "../../server/getAdminSession";
import CountrySelect from "../../components/admin/CountrySelect";
import AdministrativeAreaSelect from "../../components/admin/AdministrativeAreaSelect";
import { getAdministrativeAreaConfig } from "../../data/administrativeAreas";
import AdminReauthentication from "../../components/admin/AdminReauthentication";
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
import { ADMIN_LANGUAGE_OPTIONS } from "../../data/adminTranslations";
import styles from "../../styles/Admin.module.css";

function getDefaultCountryCode(language) {
  return (
    ADMIN_LANGUAGE_OPTIONS.find(({ code }) => code === language)?.countryCode ??
    ""
  );
}

export default function AdminSettings({ admin, businessSettings }) {
  const { language, t } = useAdminLanguage();

  const initialCountryCodeRef = useRef(businessSettings.countryCode ?? "");

  const countryInitializedRef = useRef(Boolean(businessSettings.countryCode));

  const initialPhone = parseStoredPhoneNumber(
    businessSettings.phone,
    businessSettings.countryCode
  );

  const initialMobilePhone = parseStoredPhoneNumber(
    businessSettings.mobilePhone,
    businessSettings.countryCode
  );

  const initialPhoneCountryCodeRef = useRef(initialPhone.countryCode);

  const initialMobilePhoneCountryCodeRef = useRef(
    initialMobilePhone.countryCode
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
    locationUrl: businessSettings.locationUrl ?? "",
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
  const [savedSettings, setSavedSettings] = useState(businessSettings);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (countryInitializedRef.current) {
      return;
    }

    const defaultCountryCode = getDefaultCountryCode(language);

    if (!defaultCountryCode) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      if (countryInitializedRef.current) {
        return;
      }

      initialCountryCodeRef.current = defaultCountryCode;
      countryInitializedRef.current = true;

      setFormValues((current) => {
        if (current.countryCode) {
          return current;
        }

        return {
          ...current,
          countryCode: defaultCountryCode,
          administrativeAreaCode: "",
        };
      });

      if (!initialPhoneCountryCodeRef.current) {
        setPhoneCountryCode(defaultCountryCode);
      }

      if (!initialMobilePhoneCountryCodeRef.current) {
        setMobilePhoneCountryCode(defaultCountryCode);
      }
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [language]);

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

      addressLine1: {
        ADDRESS_REQUIRED: "settings.addressRequired",
        ADDRESS_TOO_LONG: "settings.addressLine1TooLong",
      },

      addressLine2: {
        ADDRESS_TOO_LONG: "settings.addressLine2TooLong",
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

      administrativeAreaCode: {
        ADMINISTRATIVE_AREA_REQUIRED: "settings.administrativeAreaRequired",
        INVALID_ADMINISTRATIVE_AREA: "settings.invalidAdministrativeArea",
      },

      taxId: {
        TAX_ID_REQUIRED: "settings.taxIdRequired",
        TAX_ID_TOO_LONG: "settings.taxIdTooLong",
        INVALID_TAX_ID: "settings.invalidTaxId",
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

      fiscalAdministrativeAreaCode: {
        FISCAL_ADMINISTRATIVE_AREA_REQUIRED:
          "settings.fiscalAdministrativeAreaRequired",
        INVALID_FISCAL_ADMINISTRATIVE_AREA:
          "settings.invalidFiscalAdministrativeArea",
      },

      locationUrl: {
        INVALID_URL: "settings.invalidUrl",
        URL_TOO_LONG: "settings.urlTooLong",
      },

      primaryActionUrl: {
        INVALID_URL: "settings.invalidUrl",
        URL_TOO_LONG: "settings.urlTooLong",
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

  function getAdministrativeAreaName(countryCode, administrativeAreaCode) {
    if (!countryCode || !administrativeAreaCode) {
      return "";
    }

    const config = getAdministrativeAreaConfig(countryCode);

    const area = config?.areas.find(
      ({ code }) => code === administrativeAreaCode
    );

    return area?.label[language] ?? area?.label.en ?? administrativeAreaCode;
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
    if (!isFiscal) {
      countryInitializedRef.current = true;
    }

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

  function handleLocationUrlBlur(event) {
    const value = event.target.value.trim();

    let errorCode = "";

    if (value.length > 1000) {
      errorCode = "URL_TOO_LONG";
    } else if (value) {
      try {
        new URL(value);
      } catch {
        errorCode = "INVALID_URL";
      }
    }

    setFormValues((current) => ({
      ...current,
      locationUrl: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      locationUrl: errorCode,
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

  function handleEdit() {
    setError("");
    setSuccess("");
    setFieldErrors({});
    setIsEditing(true);
  }

  function handleCancel() {
    const resetPhone = parseStoredPhoneNumber(
      savedSettings.phone,
      savedSettings.countryCode
    );

    const resetMobilePhone = parseStoredPhoneNumber(
      savedSettings.mobilePhone,
      savedSettings.countryCode
    );

    const resetCountryCode =
      savedSettings.countryCode ?? initialCountryCodeRef.current;

    countryInitializedRef.current = Boolean(resetCountryCode);

    setFormValues({
      name: savedSettings.name ?? "",
      email: savedSettings.email ?? "",
      phone: resetPhone.nationalNumber,
      mobilePhone: resetMobilePhone.nationalNumber,
      addressLine1: savedSettings.addressLine1 ?? "",
      addressLine2: savedSettings.addressLine2 ?? "",
      postalCode: savedSettings.postalCode ?? "",
      city: savedSettings.city ?? "",
      countryCode: resetCountryCode,
      administrativeAreaCode: savedSettings.administrativeAreaCode ?? "",
      taxId: savedSettings.taxId ?? "",
      fiscalAddressSameAsBusiness:
        savedSettings.fiscalAddressSameAsBusiness ?? true,
      fiscalAddressLine1: savedSettings.fiscalAddressLine1 ?? "",
      fiscalAddressLine2: savedSettings.fiscalAddressLine2 ?? "",
      fiscalPostalCode: savedSettings.fiscalPostalCode ?? "",
      fiscalCity: savedSettings.fiscalCity ?? "",
      fiscalCountryCode: savedSettings.fiscalCountryCode ?? "",
      fiscalAdministrativeAreaCode:
        savedSettings.fiscalAdministrativeAreaCode ?? "",
      primaryActionUrl: savedSettings.primaryActionUrl ?? "",
      locationUrl: savedSettings.locationUrl ?? "",
    });
    setPhoneCountryCode(resetPhone.countryCode);
    setMobilePhoneCountryCode(resetMobilePhone.countryCode);
    setError("");
    setSuccess("");
    setFieldErrors({});
    setIsEditing(false);
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

    const nextFieldErrors = {};

    if (!formValues.name.trim()) {
      nextFieldErrors.name = "BUSINESS_NAME_REQUIRED";
    }

    const normalizedTaxId = normalizeTaxId(
      formValues.countryCode,
      formValues.taxId
    );

    if (!normalizedTaxId) {
      nextFieldErrors.taxId = "TAX_ID_REQUIRED";
    } else if (normalizedTaxId.length > 50) {
      nextFieldErrors.taxId = "TAX_ID_TOO_LONG";
    } else if (
      formValues.countryCode &&
      !isValidTaxId(formValues.countryCode, normalizedTaxId)
    ) {
      nextFieldErrors.taxId = "INVALID_TAX_ID";
    }

    const email = formValues.email.trim();

    if (!email) {
      nextFieldErrors.email = "EMAIL_REQUIRED";
    } else if (email.length > 254) {
      nextFieldErrors.email = "EMAIL_TOO_LONG";
    } else if (!isEmail(email)) {
      nextFieldErrors.email = "INVALID_EMAIL";
    }

    if (
      formValues.phone.trim() &&
      !isValidPhoneForCountry(phoneCountryCode, formValues.phone)
    ) {
      nextFieldErrors.phone = "INVALID_PHONE_NUMBER";
    }

    if (
      formValues.mobilePhone.trim() &&
      !isValidPhoneForCountry(mobilePhoneCountryCode, formValues.mobilePhone)
    ) {
      nextFieldErrors.mobilePhone = "INVALID_MOBILE_PHONE_NUMBER";
    }

    if (!formValues.phone.trim() && !formValues.mobilePhone.trim()) {
      nextFieldErrors.phone = "PHONE_CONTACT_REQUIRED";
    }

    if (!formValues.addressLine1.trim()) {
      nextFieldErrors.addressLine1 = "ADDRESS_REQUIRED";
    }

    if (!formValues.countryCode.trim()) {
      nextFieldErrors.countryCode = "COUNTRY_REQUIRED";
    }

    if (
      formValues.countryCode &&
      getAdministrativeAreaConfig(formValues.countryCode) &&
      !formValues.administrativeAreaCode.trim()
    ) {
      nextFieldErrors.administrativeAreaCode = "ADMINISTRATIVE_AREA_REQUIRED";
    }

    if (!formValues.city.trim()) {
      nextFieldErrors.city = "CITY_REQUIRED";
    }

    const postalCodeError = getPostalCodeError(
      "postalCode",
      formValues.countryCode,
      formValues.postalCode
    );

    if (postalCodeError) {
      nextFieldErrors.postalCode = postalCodeError;
    }

    if (!formValues.fiscalAddressSameAsBusiness) {
      if (!formValues.fiscalAddressLine1.trim()) {
        nextFieldErrors.fiscalAddressLine1 = "FISCAL_ADDRESS_REQUIRED";
      }

      if (!formValues.fiscalCountryCode.trim()) {
        nextFieldErrors.fiscalCountryCode = "FISCAL_COUNTRY_REQUIRED";
      }

      if (
        formValues.fiscalCountryCode &&
        getAdministrativeAreaConfig(formValues.fiscalCountryCode) &&
        !formValues.fiscalAdministrativeAreaCode.trim()
      ) {
        nextFieldErrors.fiscalAdministrativeAreaCode =
          "FISCAL_ADMINISTRATIVE_AREA_REQUIRED";
      }

      if (!formValues.fiscalCity.trim()) {
        nextFieldErrors.fiscalCity = "FISCAL_CITY_REQUIRED";
      }

      const fiscalPostalCodeError = getPostalCodeError(
        "fiscalPostalCode",
        formValues.fiscalCountryCode,
        formValues.fiscalPostalCode
      );

      if (fiscalPostalCodeError) {
        nextFieldErrors.fiscalPostalCode = fiscalPostalCodeError;
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      scrollToFirstFieldError(nextFieldErrors);
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
          logoPath: savedSettings.logoPath ?? null,
          faviconPath: savedSettings.faviconPath ?? null,

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
          locationUrl: formValues.locationUrl.trim() || null,
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
        locationUrl: data.settings.locationUrl ?? "",
      });

      setPhoneCountryCode(savedPhone.countryCode);
      setMobilePhoneCountryCode(savedMobilePhone.countryCode);
      initialCountryCodeRef.current = data.settings.countryCode;
      countryInitializedRef.current = true;

      setSuccess("settings.saveSuccess");
      setIsEditing(false);
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
        <AdminReauthentication
          email={admin.email}
          isSessionExpired={isSessionExpired}
          onSuccess={() => setIsSessionExpired(false)}
        />{" "}
        <section
          className={`${styles.userFormCard} ${styles.settingsFormCard}`}
        >
          <div className={styles.settingsCardHeader}>
            <h2>{t("settings.generalData")}</h2>

            {!isEditing && (
              <button
                type="button"
                className={styles.editButton}
                onClick={handleEdit}
              >
                {t("settings.edit")}
              </button>
            )}
          </div>

          {isEditing ? (
            <>
              <p className={styles.requiredFieldsNote}>
                <span className={styles.requiredMark} aria-hidden="true">
                  *
                </span>{" "}
                {t("settings.requiredField")}
              </p>

              <form
                id="business-settings-form"
                className={styles.form}
                onSubmit={handleSubmit}
                noValidate
              >
                <div className={styles.settingsFormColumns}>
                  {/* First Column */}
                  <div className={styles.settingsFormColumn}>
                    {/* business-name */}
                    <div className={styles.field}>
                      <label htmlFor="business-name">
                        {t("settings.name")}
                        <span
                          className={styles.requiredMark}
                          aria-hidden="true"
                        >
                          *
                        </span>
                      </label>
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

                    {/* business-country */}
                    <div className={styles.field}>
                      <label htmlFor="business-country">
                        {t("settings.countryCode")}

                        <span
                          className={styles.requiredMark}
                          aria-hidden="true"
                        >
                          *
                        </span>
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

                    {/* business-address-line-1 */}
                    <div className={styles.field}>
                      <label htmlFor="business-address-line-1">
                        {t("settings.addressLine1")}

                        <span
                          className={styles.requiredMark}
                          aria-hidden="true"
                        >
                          *
                        </span>
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

                    {/* business-address-line-2 */}
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

                    {/* business-city */}
                    <div className={styles.field}>
                      <label htmlFor="business-city">
                        {t("settings.city")}
                        <span
                          className={styles.requiredMark}
                          aria-hidden="true"
                        >
                          *
                        </span>
                      </label>
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

                    {/* business-postal-code */}
                    <div className={styles.field}>
                      <label htmlFor="business-postal-code">
                        {t("settings.postalCode")}

                        <span
                          className={styles.requiredMark}
                          aria-hidden="true"
                        >
                          *
                        </span>
                      </label>
                      <input
                        id="business-postal-code"
                        name="postalCode"
                        type="text"
                        value={formValues.postalCode}
                        placeholder={getPostalCodeExample(
                          formValues.countryCode
                        )}
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

                  {/* Second Column */}
                  <div className={styles.settingsFormColumn}>
                    {/* business-tax-id */}
                    <div className={styles.field}>
                      <label htmlFor="business-tax-id">
                        {t("settings.taxId")}
                        <span
                          className={styles.requiredMark}
                          aria-hidden="true"
                        >
                          *
                        </span>
                      </label>
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
                            {t(
                              getFieldErrorMessage("taxId", fieldErrors.taxId)
                            )}
                          </p>
                        )}
                    </div>

                    {/* business-email */}
                    <div className={styles.field}>
                      <label htmlFor="business-email">
                        {t("settings.email")}
                        <span
                          className={styles.requiredMark}
                          aria-hidden="true"
                        >
                          *
                        </span>
                      </label>
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

                    {/* business-phone */}
                    <div className={styles.field}>
                      <label htmlFor="business-phone">
                        {t("settings.phone")}
                      </label>
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

                    {/* business-mobile-phone */}
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

                    {/* business-location-url */}
                    <div className={styles.field}>
                      <label htmlFor="business-location-url">
                        {t("settings.locationUrl")}
                      </label>

                      <input
                        id="business-location-url"
                        name="locationUrl"
                        type="url"
                        value={formValues.locationUrl}
                        placeholder="http://"
                        disabled={isSaving}
                        onChange={handleChange}
                        onBlur={handleLocationUrlBlur}
                      />

                      {fieldErrors.locationUrl &&
                        getFieldErrorMessage(
                          "locationUrl",
                          fieldErrors.locationUrl
                        ) && (
                          <p className={styles.error} role="alert">
                            {t(
                              getFieldErrorMessage(
                                "locationUrl",
                                fieldErrors.locationUrl
                              )
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
                        {/* business-fiscal-address */}
                        <div className={styles.field}>
                          <label htmlFor="business-fiscal-address">
                            {t("settings.fiscalAddressLine1")}
                            <span
                              className={styles.requiredMark}
                              aria-hidden="true"
                            >
                              *
                            </span>
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

                        {/* business-fiscal-address-2 */}
                        <div className={styles.field}>
                          <label htmlFor="business-fiscal-address-2">
                            {t("settings.fiscalAddressLine2")}
                            <span
                              className={styles.requiredMark}
                              aria-hidden="true"
                            >
                              *
                            </span>
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

                        {/* business-fiscal-city */}
                        <div className={styles.field}>
                          <label htmlFor="business-fiscal-city">
                            {t("settings.fiscalCity")}
                            <span
                              className={styles.requiredMark}
                              aria-hidden="true"
                            >
                              *
                            </span>
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
                      </div>

                      <div className={styles.settingsFormColumn}>
                        {/* business-fiscal-postal-code */}
                        <div className={styles.field}>
                          <label htmlFor="business-fiscal-postal-code">
                            {t("settings.fiscalPostalCode")}
                            <span
                              className={styles.requiredMark}
                              aria-hidden="true"
                            >
                              *
                            </span>
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

                        {/* business-fiscal-country */}
                        <div className={styles.field}>
                          <label htmlFor="business-fiscal-country">
                            {t("settings.fiscalCountryCode")}
                            <span
                              className={styles.requiredMark}
                              aria-hidden="true"
                            >
                              *
                            </span>
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
            </>
          ) : (
            <>
              {/* List mode */}
              <div className={styles.settingsReadColumns}>
                <dl className={styles.settingsReadColumn}>
                  <div className={styles.settingsReadItem}>
                    <dt className={styles.settingsReadLabel}>
                      {t("settings.name")}
                    </dt>
                    <dd className={styles.settingsReadValue}>
                      {savedSettings.name || t("settings.notDefined")}
                    </dd>
                  </div>
                  <div className={styles.settingsReadItem}>
                    <dt className={styles.settingsReadLabel}>
                      {t("settings.countryCode")}
                    </dt>
                    <dd className={styles.settingsReadValue}>
                      {savedSettings.countryCode
                        ? getCountryName(savedSettings.countryCode)
                        : t("settings.notDefined")}
                    </dd>
                  </div>
                  {getAdministrativeAreaConfig(savedSettings.countryCode) && (
                    <div className={styles.settingsReadItem}>
                      <dt className={styles.settingsReadLabel}>
                        {getAdministrativeAreaConfig(savedSettings.countryCode)
                          .label[language] ??
                          getAdministrativeAreaConfig(savedSettings.countryCode)
                            .label.en}
                      </dt>

                      <dd className={styles.settingsReadValue}>
                        {getAdministrativeAreaName(
                          savedSettings.countryCode,
                          savedSettings.administrativeAreaCode
                        ) || t("settings.notDefined")}
                      </dd>
                    </div>
                  )}
                  <div className={styles.settingsReadItem}>
                    <dt className={styles.settingsReadLabel}>
                      {t("settings.addressLine1")}
                    </dt>
                    <dd className={styles.settingsReadValue}>
                      {savedSettings.addressLine1 || t("settings.notDefined")}
                    </dd>
                  </div>
                  <div className={styles.settingsReadItem}>
                    <dt className={styles.settingsReadLabel}>
                      {t("settings.addressLine2")}
                    </dt>
                    <dd className={styles.settingsReadValue}>
                      {savedSettings.addressLine2 || t("settings.notDefined")}
                    </dd>
                  </div>
                  <div className={styles.settingsReadItem}>
                    <dt className={styles.settingsReadLabel}>
                      {t("settings.postalCode")}
                    </dt>
                    <dd className={styles.settingsReadValue}>
                      {savedSettings.postalCode || savedSettings.city
                        ? [savedSettings.postalCode, savedSettings.city]
                            .filter(Boolean)
                            .join(" ")
                        : t("settings.notDefined")}
                    </dd>
                  </div>{" "}
                </dl>

                <dl className={styles.settingsReadColumn}>
                  <div className={styles.settingsReadItem}>
                    <dt className={styles.settingsReadLabel}>
                      {t("settings.taxId")}
                    </dt>
                    <dd className={styles.settingsReadValue}>
                      {savedSettings.taxId || t("settings.notDefined")}
                    </dd>
                  </div>

                  <div className={styles.settingsReadItem}>
                    <dt className={styles.settingsReadLabel}>
                      {t("settings.email")}
                    </dt>
                    <dd className={styles.settingsReadValue}>
                      {savedSettings.email || t("settings.notDefined")}
                    </dd>
                  </div>

                  <div className={styles.settingsReadItem}>
                    <dt className={styles.settingsReadLabel}>
                      {t("settings.phone")}
                    </dt>
                    <dd className={styles.settingsReadValue}>
                      {savedSettings.phone || t("settings.notDefined")}
                    </dd>
                  </div>

                  <div className={styles.settingsReadItem}>
                    <dt className={styles.settingsReadLabel}>
                      {t("settings.mobilePhone")}
                    </dt>
                    <dd className={styles.settingsReadValue}>
                      {savedSettings.mobilePhone || t("settings.notDefined")}
                    </dd>
                  </div>

                  <div className={styles.settingsReadItem}>
                    <dt className={styles.settingsReadLabel}>
                      {t("settings.locationUrl")}
                    </dt>

                    <dd className={styles.settingsReadValue}>
                      {savedSettings.locationUrl ? (
                        <a
                          href={savedSettings.locationUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {savedSettings.locationUrl}
                        </a>
                      ) : (
                        t("settings.notDefined")
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </>
          )}
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
