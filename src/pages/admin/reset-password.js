import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { authClient } from "../../lib/authClient";
import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { ADMIN_LANGUAGE_OPTIONS } from "../../data/adminTranslations";
import styles from "../../styles/Admin.module.css";

export default function AdminResetPassword() {
  const router = useRouter();
  const { language, changeLanguage, t } = useAdminLanguage();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errorKey, setErrorKey] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token =
    typeof router.query.token === "string" ? router.query.token : "";

  const invalidToken =
    router.isReady && (router.query.error === "INVALID_TOKEN" || !token);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const queryLanguage =
      typeof router.query.lang === "string" ? router.query.lang : "";

    if (
      ["pt", "es", "en"].includes(queryLanguage) &&
      queryLanguage !== language
    ) {
      changeLanguage(queryLanguage);
    }
  }, [router.isReady, router.query.lang, language, changeLanguage]);

  function validateForm() {
    const errors = {};

    if (!newPassword) {
      errors.newPassword = "validation.newPasswordRequired";
    } else if (newPassword.length < 12) {
      errors.newPassword = "validation.passwordMinLength";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "validation.confirmPasswordRequired";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "passwordRecovery.passwordMismatch";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorKey("");

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setErrorKey("passwordRecovery.invalidToken");
      return;
    }

    setIsSubmitting(true);

    const { error } = await authClient.resetPassword({
      newPassword,
      token,
    });

    if (error) {
      setErrorKey("passwordRecovery.resetFailed");
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
    setIsSubmitting(false);
  }

  return (
    <>
      <Head>
        <title>{t("passwordRecovery.resetPageTitle")}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className={styles.page}>
        <section className={styles.card}>
          <Image
            className={styles.logo}
            src="/assets/images/logo_text_280_100.png"
            alt="Caldo Verde"
            width={280}
            height={100}
            priority
          />

          <div className={styles.loginLanguageSelector}>
            <label htmlFor="admin-language">{t("layout.language")}</label>

            <select
              id="admin-language"
              value={language}
              onChange={(event) => changeLanguage(event.target.value)}
            >
              {ADMIN_LANGUAGE_OPTIONS.map(({ code }) => (
                <option key={code} value={code}>
                  {code.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <h1 className={styles.title}>{t("passwordRecovery.resetTitle")}</h1>

          <p className={styles.subtitle}>
            {t("passwordRecovery.resetSubtitle")}
          </p>

          {invalidToken ? (
            <>
              <p className={styles.error} role="alert">
                {t("passwordRecovery.invalidToken")}
              </p>

              <Link href="/admin/forgot-password" className={styles.authLink}>
                {t("passwordRecovery.requestTitle")}
              </Link>
            </>
          ) : success ? (
            <>
              <p className={styles.successMessage} role="status">
                {t("passwordRecovery.resetSuccess")}
              </p>

              <Link href="/admin/login" className={styles.authLink}>
                {t("passwordRecovery.backToLogin")}
              </Link>
            </>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="new-password">
                  {t("passwordRecovery.newPassword")}
                </label>

                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setNewPassword(event.target.value);

                    if (fieldErrors.newPassword) {
                      setFieldErrors((current) => ({
                        ...current,
                        newPassword: "",
                      }));
                    }

                    if (errorKey) {
                      setErrorKey("");
                    }
                  }}
                />

                {fieldErrors.newPassword && (
                  <p className={styles.error} role="alert">
                    {t(fieldErrors.newPassword)}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="confirm-password">
                  {t("passwordRecovery.confirmPassword")}
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);

                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((current) => ({
                        ...current,
                        confirmPassword: "",
                      }));
                    }

                    if (errorKey) {
                      setErrorKey("");
                    }
                  }}
                />

                {fieldErrors.confirmPassword && (
                  <p className={styles.error} role="alert">
                    {t(fieldErrors.confirmPassword)}
                  </p>
                )}
              </div>

              {errorKey && (
                <p className={styles.error} role="alert">
                  {t(errorKey)}
                </p>
              )}

              <button
                className={styles.button}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t("passwordRecovery.resetSubmitting")
                  : t("passwordRecovery.resetSubmit")}
              </button>

              <Link href="/admin/login" className={styles.authLink}>
                {t("passwordRecovery.backToLogin")}
              </Link>
            </form>
          )}
        </section>
      </main>
    </>
  );
}
