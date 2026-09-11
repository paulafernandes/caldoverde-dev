import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { authClient } from "../../lib/authClient";
import styles from "../../styles/Admin.module.css";

export default function AdminLayout({
  admin,
  children,
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] =
    useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    await authClient.signOut();

    await router.replace("/admin/login");
  }

  return (
    <main className={styles.adminDashboard}>
      <div className={styles.adminShell}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <Link
              href="/admin"
              className={styles.brandMark}
              aria-label="Dashboard da administração"
            >
              CV
            </Link>

            <div className={styles.brandText}>
              <strong>
                Caldo Verde · Administração
              </strong>

              <span>{admin.email}</span>
            </div>
          </div>

          <button
            className={styles.logoutButton}
            type="button"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            {isSigningOut
              ? "A sair..."
              : "Terminar sessão"}
          </button>
        </header>
        {router.pathname !== "/admin" && (
          <div className={styles.adminBackNavigation}>
            <Link
              href="/admin"
              className={styles.adminBackButton}
            >
              ← Voltar
            </Link>
          </div>
        )}
        {children}
      </div>
    </main>
  );
}
