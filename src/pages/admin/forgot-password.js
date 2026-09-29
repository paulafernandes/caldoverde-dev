import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { authClient } from "../../lib/authClient";
import { getAdminSession } from "../../server/getAdminSession";
import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { ADMIN_LANGUAGE_OPTIONS } from "../../data/adminTranslations";
import styles from "../../styles/Admin.module.css";

import { useState } from "react";

export default function AdminForgotPassword() {
  const { language, changeLanguage, t } = useAdminLanguage();

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [errorKey, setErrorKey] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setFieldError("");
    setErrorKey("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setFieldError("validation.emailRequired");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFieldError("validation.emailInvalid");
      return;
    }

    setIsSubmitting(true);

    const { error } = await authClient.requestPasswordReset({
      email: trimmedEmail,
      redirectTo: `/admin/reset-password?lang=${language}`,
    });

    if (error) {
      setErrorKey("passwordRecovery.requestFailed");
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setIsSubmitting(false);
  }

  return (
    <>
      <Head>
        <title>{t("passwordRecovery.requestPageTitle")}</title>
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

          <h1 className={styles.title}>{t("passwordRecovery.requestTitle")}</h1>

          {!success && (
            <p className={styles.subtitle}>
              {t("passwordRecovery.requestSubtitle")}
            </p>
          )}

          {success ? (
            <>
              <p className={styles.successMessage} role="status">
                {t("passwordRecovery.requestSuccess")}
              </p>

              <Link href="/admin/login" className={styles.authLink}>
                {t("passwordRecovery.backToLogin")}
              </Link>
            </>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="recovery-email">{t("login.email")}</label>

                <input
                  id="recovery-email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    if (fieldError) {
                      setFieldError("");
                    }

                    if (errorKey) {
                      setErrorKey("");
                    }
                  }}
                />

                {fieldError && (
                  <p className={styles.error} role="alert">
                    {t(fieldError)}
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
                  ? t("passwordRecovery.requestSubmitting")
                  : t("passwordRecovery.requestSubmit")}
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

export async function getServerSideProps({ req }) {
  const session = await getAdminSession(req);

  if (session) {
    return {
      redirect: {
        destination: "/admin/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
