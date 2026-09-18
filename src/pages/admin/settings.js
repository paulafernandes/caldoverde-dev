import Head from "next/head";
import { useEffect, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { getBusinessSettings } from "../../server/businessSettingsService";
import { getAdminSession } from "../../server/getAdminSession";
import { authClient } from "../../lib/authClient";
import styles from "../../styles/Admin.module.css";

export default function AdminSettings({ admin, businessSettings }) {
  const { t } = useAdminLanguage();

  const [formValues, setFormValues] = useState({
    name: businessSettings.name ?? "",
    email: businessSettings.email ?? "",
    phone: businessSettings.phone ?? "",
    addressLine1: businessSettings.addressLine1 ?? "",
    addressLine2: businessSettings.addressLine2 ?? "",
    postalCode: businessSettings.postalCode ?? "",
    city: businessSettings.city ?? "",
    countryCode: businessSettings.countryCode ?? "",
    primaryActionUrl: businessSettings.primaryActionUrl ?? "",
  });

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
        PHONE_REQUIRED: "settings.phoneRequired",
        PHONE_TOO_LONG: "settings.phoneTooLong",
      },
      addressLine1: {
        ADDRESS_REQUIRED: "settings.addressRequired",
        ADDRESS_TOO_LONG: "settings.addressLine1TooLong",
      },
      postalCode: {
        POSTAL_CODE_REQUIRED: "settings.postalCodeRequired",
        POSTAL_CODE_TOO_LONG: "settings.postalCodeTooLong",
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
    };

    return fieldErrorMessages[field]?.[code] ?? null;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function handleCancel() {
    setFormValues({
      name: businessSettings.name ?? "",
      email: businessSettings.email ?? "",
      phone: businessSettings.phone ?? "",
      addressLine1: businessSettings.addressLine1 ?? "",
      addressLine2: businessSettings.addressLine2 ?? "",
      postalCode: businessSettings.postalCode ?? "",
      city: businessSettings.city ?? "",
      countryCode: businessSettings.countryCode ?? "",
      primaryActionUrl: businessSettings.primaryActionUrl ?? "",
    });

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

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!formValues.name.trim()) {
      setError("settings.nameRequired");
      return;
    }

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
          phone: formValues.phone.trim(),
          addressLine1: formValues.addressLine1.trim(),
          addressLine2: formValues.addressLine2.trim() || null,
          postalCode: formValues.postalCode.trim(),
          city: formValues.city.trim(),
          countryCode: formValues.countryCode.trim(),
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
            if (detail.field) {
              nextFieldErrors[detail.field] = detail.code;
            }
          }

          setFieldErrors(nextFieldErrors);
          return;
        }

        throw new Error(data.error ?? "BUSINESS_SETTINGS_UPDATE_FAILED");
      }

      setFormValues({
        name: data.settings.name ?? "",
        email: data.settings.email ?? "",
        phone: data.settings.phone ?? "",
        addressLine1: data.settings.addressLine1 ?? "",
        addressLine2: data.settings.addressLine2 ?? "",
        postalCode: data.settings.postalCode ?? "",
        city: data.settings.city ?? "",
        countryCode: data.settings.countryCode ?? "",
        primaryActionUrl: data.settings.primaryActionUrl ?? "",
      });

      setSuccess("settings.saveSuccess");
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

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
                  <label htmlFor="business-email">{t("settings.email")}</label>

                  <input
                    id="business-email"
                    name="email"
                    type="email"
                    required
                    value={formValues.email}
                    disabled={isSaving}
                    onChange={handleChange}
                  />
                  {fieldErrors.email && (
                    <p className={styles.error} role="alert">
                      {t(getFieldErrorMessage("email", fieldErrors.email))}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="business-phone">{t("settings.phone")}</label>

                  <input
                    id="business-phone"
                    name="phone"
                    type="text"
                    required
                    value={formValues.phone}
                    disabled={isSaving}
                    onChange={handleChange}
                  />
                  {fieldErrors.phone && (
                    <p className={styles.error} role="alert">
                      {t(getFieldErrorMessage("phone", fieldErrors.phone))}
                    </p>
                  )}
                </div>

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
              </div>

              <div className={styles.settingsFormColumn}>
                <div className={styles.field}>
                  <label htmlFor="business-country">
                    {t("settings.countryCode")}
                  </label>

                  <input
                    id="business-country"
                    name="countryCode"
                    type="text"
                    required
                    maxLength={2}
                    value={formValues.countryCode}
                    disabled={isSaving}
                    onChange={handleChange}
                  />
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
                    <p className={styles.city} role="alert">
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
                    disabled={isSaving}
                    required
                    onChange={handleChange}
                  />
                  {fieldErrors.postalCode && (
                    <p className={styles.error} role="alert">
                      {t(
                        getFieldErrorMessage(
                          "postalCode",
                          fieldErrors.postalCode
                        )
                      )}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="business-primary-action">
                    {t("settings.primaryActionUrl")}
                  </label>

                  <input
                    id="business-primary-action"
                    name="primaryActionUrl"
                    type="url"
                    value={formValues.primaryActionUrl}
                    disabled={isSaving}
                    onChange={handleChange}
                  />
                  {fieldErrors.primaryActionUrl && (
                    <p className={styles.error} role="alert">
                      {t(
                        getFieldErrorMessage(
                          "primaryActionUrl",
                          fieldErrors.primaryActionUrl
                        )
                      )}
                    </p>
                  )}
                </div>
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
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {t(error)}
              </p>
            )}

            {success && (
              <p
                className={`${styles.successMessage} ${styles.formMessage}`}
                role="status"
              >
                {t(success)}
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
