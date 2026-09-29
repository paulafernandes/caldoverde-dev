import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";

import { authClient } from "../../lib/authClient";
import { getAdminSession } from "../../server/getAdminSession";
import { useAdminLanguage } from "../../context/AdminLanguageContext";
import styles from "../../styles/Admin.module.css";

export default function AdminLogin() {
  const router = useRouter();
  const { language, changeLanguage, t } = useAdminLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
    const errors = {};

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = "validation.emailRequired";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "validation.emailInvalid";
    }

    if (!password) {
      errors.password = "validation.passwordRequired";
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

    setIsSubmitting(true);

    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorKey("login.invalidCredentials");
      setIsSubmitting(false);
      return;
    }

    await router.replace("/admin");
  }

  return (
    <>
      <Head>
        <title>{t("login.pageTitle")}</title>
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
              <option value="pt">PT</option>
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </div>
          <h1 className={styles.title}>{t("login.title")}</h1>

          <p className={styles.subtitle}>{t("login.subtitle")}</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="admin-email">{t("login.email")}</label>

              <input
                id="admin-email"
                type="email"
                value={email}
                autoComplete="email"
                required
                onChange={(event) => {
                  setEmail(event.target.value);

                  if (fieldErrors.email) {
                    setFieldErrors((current) => ({
                      ...current,
                      email: "",
                    }));
                  }
                }}
              />
              {fieldErrors.email && (
                <p className={styles.error} role="alert">
                  {t(fieldErrors.email)}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="admin-password">{t("login.password")}</label>

              <input
                id="admin-password"
                type="password"
                value={password}
                autoComplete="current-password"
                required
                onChange={(event) => {
                  setPassword(event.target.value);

                  if (fieldErrors.password) {
                    setFieldErrors((current) => ({
                      ...current,
                      password: "",
                    }));
                  }
                }}
              />
              {fieldErrors.password && (
                <p className={styles.error} role="alert">
                  {t(fieldErrors.password)}
                </p>
              )}
            </div>

            <Link href="/admin/forgot-password" className={styles.authLink}>
              {t("passwordRecovery.forgotLink")}
            </Link>

            <button
              className={styles.button}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("login.submitting") : t("login.submit")}
            </button>
          </form>
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
