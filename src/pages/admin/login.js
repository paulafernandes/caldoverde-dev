import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

import { authClient } from "../../lib/authClient";
import { getAdminSession } from "../../server/getAdminSession";
import styles from "../../styles/Admin.module.css";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(
        "Email ou palavra-passe incorretos."
      );
      setIsSubmitting(false);
      return;
    }

    await router.replace("/admin/menu");
  }

  return (
    <>
      <Head>
        <title>Administração | Caldo Verde</title>
        <meta
          name="robots"
          content="noindex, nofollow"
        />
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

          <h1 className={styles.title}>
            Administração
          </h1>

          <p className={styles.subtitle}>
            Inicia sessão para gerir a ementa.
          </p>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >
            <div className={styles.field}>
              <label htmlFor="admin-email">
                Email
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                autoComplete="email"
                required
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="admin-password">
                Palavra-passe
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                autoComplete="current-password"
                required
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />
            </div>

            {errorMessage && (
              <p
                className={styles.error}
                role="alert"
              >
                {errorMessage}
              </p>
            )}

            <button
              className={styles.button}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "A entrar..."
                : "Entrar"}
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
        destination: "/admin/menu",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
