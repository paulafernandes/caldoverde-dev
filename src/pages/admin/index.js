import Head from "next/head";
import Link from "next/link";

import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminSession } from "../../server/getAdminSession";
import { useAdminLanguage } from "../../context/AdminLanguageContext";
import styles from "../../styles/Admin.module.css";

export default function AdminDashboard({ admin }) {
  const { t } = useAdminLanguage();

  return (
    <>
      <Head>
        <title>{t("dashboard.pageTitle")}</title>

        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout admin={admin}>
        <section className={styles.dashboardHeading}>
          <div>
            <h1>{t("dashboard.title")}</h1>

            <p>
              {t("dashboard.welcome", {
                name: admin.name,
              })}
            </p>
          </div>
        </section>

        <section className={styles.dashboardCards}>
          <Link href="/admin/account" className={styles.adminDashboardCard}>
            <strong>{t("dashboard.accountTitle")}</strong>

            <span>{t("dashboard.accountDescription")}</span>
          </Link>

          <Link href="/admin/users" className={styles.adminDashboardCard}>
            <strong>{t("dashboard.usersTitle")}</strong>

            <span>{t("dashboard.usersDescription")}</span>
          </Link>

          <Link href="/admin/menu" className={styles.adminDashboardCard}>
            <strong>{t("dashboard.menuTitle")}</strong>

            <span>{t("dashboard.menuDescription")}</span>
          </Link>
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

  return {
    props: {
      admin: {
        name: session.user.name,
        email: session.user.email,
      },
    },
  };
}
