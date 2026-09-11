import Head from "next/head";
import { useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { authClient } from "../../lib/authClient";
import { getAdminSession } from "../../server/getAdminSession";
import styles from "../../styles/Admin.module.css";

export default function AdminAccount({ admin }) {
  const [name, setName] = useState(admin.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [isChangingPassword, setIsChangingPassword] =
    useState(false);
  const [passwordError, setPasswordError] =
    useState("");
  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  async function handleUpdateProfile(event) {
    event.preventDefault();

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } =
        await authClient.updateUser({
          name: name.trim(),
        });

      if (updateError) {
        throw new Error(
          updateError.message ||
          "Não foi possível atualizar a conta."
        );
      }

      setName(name.trim());
      setSuccess("Nome atualizado com sucesso.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }
  async function handleChangePassword(event) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "A confirmação da nova palavra-passe não coincide."
      );
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error: changeError } =
        await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        });

      if (changeError) {
        throw new Error(
          changeError.message ||
          "Não foi possível alterar a palavra-passe."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess(
        "Palavra-passe alterada com sucesso."
      );
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  }
  return (
    <>
      <Head>
        <title>Minha conta | Caldo Verde</title>

        <meta
          name="robots"
          content="noindex, nofollow"
        />
      </Head>

      <AdminLayout admin={admin}>
        <section className={styles.dashboardHeading}>
          <div>
            <h1>Minha conta</h1>

            <p>
              Gerir os teus dados de acesso à administração.
            </p>
          </div>
        </section>

        <section className={styles.userFormCard}>
          <h2>Dados da conta</h2>

          <form
            className={styles.form}
            onSubmit={handleUpdateProfile}
          >
            <div className={styles.field}>
              <label htmlFor="account-name">
                Nome
              </label>

              <input
                id="account-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="account-email">
                Email
              </label>

              <input
                id="account-email"
                type="email"
                value={admin.email}
                disabled
              />
            </div>

            {error && (
              <p className={styles.error}>
                {error}
              </p>
            )}

            {success && (
              <p>{success}</p>
            )}

            <div className={styles.userFormActions}>
              <button
                type="submit"
                className={styles.button}
                disabled={isSaving}
              >
                {isSaving
                  ? "A guardar..."
                  : "Guardar alterações"}
              </button>
            </div>
          </form>
        </section>
        <section className={styles.userFormCard}>
          <h2>Segurança</h2>

          <form
            className={styles.form}
            onSubmit={handleChangePassword}
          >
            <div className={styles.field}>
              <label htmlFor="current-password">
                Palavra-passe atual
              </label>

              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="new-password">
                Nova palavra-passe
              </label>

              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                autoComplete="new-password"
                minLength={12}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirm-password">
                Confirmar nova palavra-passe
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                minLength={12}
                required
              />
            </div>

            {passwordError && (
              <p className={styles.error}>
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p>{passwordSuccess}</p>
            )}

            <div className={styles.userFormActions}>
              <button
                type="submit"
                className={styles.button}
                disabled={isChangingPassword}
              >
                {isChangingPassword
                  ? "A alterar..."
                  : "Alterar palavra-passe"}
              </button>
            </div>
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

  return {
    props: {
      admin: {
        name: session.user.name,
        email: session.user.email,
      },
    },
  };
}
