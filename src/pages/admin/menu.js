import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import { authClient } from "../../lib/authClient";
import { getAdminSession } from "../../server/getAdminSession";
import styles from "../../styles/Admin.module.css";

export default function AdminMenuPage({ admin }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] =
    useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    await router.replace("/admin/login");
  }

  return (
    <>
      <Head>
        <title>Ementa | Administração</title>
        <meta
          name="robots"
          content="noindex, nofollow"
        />
      </Head>

      <main className={styles.page}>
        <section
          className={`${styles.card} ${styles.adminCard}`}
        >
          <header className={styles.adminHeader}>
            <div>
              <h1>Gestão da ementa</h1>
              <p>
                Sessão iniciada como {admin.email}
              </p>
            </div>

            <button
              className={styles.button}
              type="button"
              disabled={isSigningOut}
              onClick={handleSignOut}
            >
              {isSigningOut
                ? "A sair..."
                : "Terminar sessão"}
            </button>
          </header>

          <div className={styles.adminContent}>
            <h2>Área protegida</h2>

            <p>
              A autenticação está funcional. A gestão de
              categorias e pratos será acrescentada no
              próximo passo.
            </p>
          </div>
        </section>
      </main>
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

  return {
    props: {
      admin: {
        name: session.user.name,
        email: session.user.email,
      },
    },
  };
}
