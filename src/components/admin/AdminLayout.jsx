import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { authClient } from "../../lib/authClient";
import styles from "../../styles/Admin.module.css";
import { useAdminLanguage } from "../../context/AdminLanguageContext";

export default function AdminLayout({ admin, children }) {
  const router = useRouter();
  const { language, changeLanguage, t } = useAdminLanguage();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
              aria-label={t("layout.dashboardAriaLabel")}
            >
              CV
            </Link>

            <div className={styles.brandText}>
              <strong>{t("layout.title")}</strong>

              <span>{admin.email}</span>
            </div>
          </div>
          <select
            value={language}
            onChange={(event) => changeLanguage(event.target.value)}
            aria-label={t("layout.language")}
          >
            <option value="pt">PT</option>
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
          <button
            className={styles.logoutButton}
            type="button"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            {isSigningOut ? t("common.signingOut") : t("common.logout")}
          </button>
        </header>
        {router.pathname !== "/admin" && (
          <div className={styles.adminBackNavigation}>
            <Link href="/admin" className={styles.adminBackButton}>
              ← {t("common.back")}
            </Link>
          </div>
        )}
        {children}
      </div>
    </main>
  );
}
