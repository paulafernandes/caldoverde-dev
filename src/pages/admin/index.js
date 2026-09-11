import Head from "next/head";
import Link from "next/link";

import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminSession } from "../../server/getAdminSession";
import styles from "../../styles/Admin.module.css";

export default function AdminDashboard({ admin }) {
  return (
    <>
      <Head>
        <title>Administração | Caldo Verde</title>

        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout admin={admin}>
        <section className={styles.dashboardHeading}>
          <div>
            <h1>Administração</h1>

            <p>Bem-vinda, {admin.name}.</p>
          </div>
        </section>

        <section className={styles.dashboardCards}>
          <Link href="/admin/account" className={styles.adminDashboardCard}>
            <strong>A minha conta</strong>

            <span>Alterar o nome e a palavra-passe da tua conta.</span>
          </Link>

          <Link href="/admin/users" className={styles.adminDashboardCard}>
            <strong>Utilizadores</strong>

            <span>
              Criar, editar, desativar e reativar utilizadores da administração.
            </span>
          </Link>

          <Link href="/admin/menu" className={styles.adminDashboardCard}>
            <strong>Menu</strong>

            <span>
              Gerir categorias, subcategorias, pratos, traduções e preços.
            </span>
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
