import Head from "next/head";
import { useEffect, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { authClient } from "../../lib/authClient";
import { getAdminSession } from "../../server/getAdminSession";
import styles from "../../styles/Admin.module.css";
import { useAdminLanguage } from "../../context/AdminLanguageContext";

export default function AdminAccount({ admin }) {
  const { t } = useAdminLanguage();
  const [name, setName] = useState(admin.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const [reauthEmail, setReauthEmail] = useState(admin.email);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [showReauthForm, setShowReauthForm] = useState(false);
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});
  const [reauthFieldErrors, setReauthFieldErrors] = useState({});

  useEffect(() => {
    function handleSessionExpired() {
      setIsSessionExpired(true);
      setError("");
      setPasswordError("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.addEventListener("admin-session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("admin-session-expired", handleSessionExpired);
    };
  }, []);
  function validateReauthForm() {
    const errors = {};
    const trimmedEmail = reauthEmail.trim();

    if (!trimmedEmail) {
      errors.email = "validation.emailRequired";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "validation.emailInvalid";
    }

    if (!reauthPassword) {
      errors.password = "validation.passwordRequired";
    }

    setReauthFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function validateProfileForm() {
    const errors = {};

    if (!name.trim()) {
      errors.name = "validation.nameRequired";
    }

    setProfileFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function validatePasswordForm() {
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = "validation.currentPasswordRequired";
    }

    if (!newPassword) {
      errors.newPassword = "validation.newPasswordRequired";
    } else if (newPassword.length < 12) {
      errors.newPassword = "validation.passwordMinLength";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "validation.confirmPasswordRequired";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "account.passwordMismatch";
    }

    setPasswordFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function handleUnauthorizedError(authError) {
    if (
      authError?.status === 401 ||
      authError?.statusCode === 401 ||
      authError?.message === "Unauthorized"
    ) {
      window.dispatchEvent(new Event("admin-session-expired"));

      return true;
    }

    return false;
  }

  async function handleReauthenticate(event) {
    event.preventDefault();

    setReauthError("");
    if (!validateReauthForm()) {
      return;
    }
    setIsReauthenticating(true);

    const { error: signInError } = await authClient.signIn.email({
      email: reauthEmail.trim(),
      password: reauthPassword,
    });

    if (signInError) {
      setReauthError("session.signInFailed");

      setIsReauthenticating(false);
      return;
    }

    setIsSessionExpired(false);
    setShowReauthForm(false);
    setReauthPassword("");
    setReauthError("");
    setIsReauthenticating(false);
  }

  async function handleUpdateProfile(event) {
    event.preventDefault();

    if (!validateProfileForm()) {
      return;
    }
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await authClient.updateUser({
        name: name.trim(),
      });

      if (updateError) {
        if (handleUnauthorizedError(updateError)) {
          return;
        }

        throw new Error("account.updateFailed");
      }

      setName(name.trim());
      setSuccess("account.updateSuccess");
      setActiveSection(null);
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

    if (!validatePasswordForm()) {
      return;
    }
    setIsChangingPassword(true);

    try {
      const { error: changeError } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (changeError) {
        if (changeError.code === "INVALID_PASSWORD") {
          throw new Error("account.currentPasswordIncorrect");
        }

        if (handleUnauthorizedError(changeError)) {
          return;
        }

        throw new Error("account.passwordChangeFailed");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess("account.passwordSuccess");
      setActiveSection(null);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  }
  function handleCancelProfile() {
    setName(admin.name);
    setProfileFieldErrors({});
    setError("");
    setSuccess("");
    setActiveSection(null);
  }

  function handleCancelPassword() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordFieldErrors({});
    setPasswordError("");
    setPasswordSuccess("");
    setActiveSection(null);
  }
  return (
    <>
      <Head>
        <title>{t("account.pageTitle")}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout admin={admin}>
        <section className={styles.dashboardHeading}>
          <div>
            <h1>{t("account.title")}</h1>

            <p>{t("account.subtitle")}</p>
          </div>
        </section>
        {isSessionExpired && (
          <div className={styles.sessionExpiredNotice} role="alert">
            <strong>{t("session.expiredTitle")}</strong>

            <p>{t("session.expiredDescription")}</p>

            {!showReauthForm ? (
              <button
                className={styles.saveButton}
                type="button"
                onClick={() => setShowReauthForm(true)}
              >
                {t("session.reauthenticate")}
              </button>
            ) : (
              <form
                className={styles.reauthForm}
                onSubmit={handleReauthenticate}
                noValidate
              >
                <label>
                  <span>{t("session.email")}</span>

                  <input
                    className={styles.editorInput}
                    type="email"
                    autoComplete="username"
                    required
                    disabled={isReauthenticating}
                    value={reauthEmail}
                    onChange={(event) => {
                      setReauthEmail(event.target.value);

                      if (reauthFieldErrors.email) {
                        setReauthFieldErrors((current) => ({
                          ...current,
                          email: "",
                        }));
                      }
                    }}
                  />
                  {reauthFieldErrors.email && (
                    <p className={styles.errorMessage} role="alert">
                      {t(reauthFieldErrors.email)}
                    </p>
                  )}
                </label>

                <label>
                  <span>{t("session.password")}</span>

                  <input
                    className={styles.editorInput}
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={isReauthenticating}
                    value={reauthPassword}
                    onChange={(event) => {
                      setReauthPassword(event.target.value);

                      if (reauthFieldErrors.password) {
                        setReauthFieldErrors((current) => ({
                          ...current,
                          password: "",
                        }));
                      }
                    }}
                  />
                  {reauthFieldErrors.password && (
                    <p className={styles.errorMessage} role="alert">
                      {t(reauthFieldErrors.password)}
                    </p>
                  )}
                </label>

                {reauthError && (
                  <p className={styles.errorMessage}>{t(reauthError)}</p>
                )}

                <div className={styles.reauthActions}>
                  <button
                    className={styles.cancelButton}
                    type="button"
                    disabled={isReauthenticating}
                    onClick={() => {
                      setShowReauthForm(false);
                      setReauthPassword("");
                      setReauthError("");
                    }}
                  >
                    {t("session.cancel")}
                  </button>

                  <button
                    className={styles.saveButton}
                    type="submit"
                    disabled={isReauthenticating}
                  >
                    {isReauthenticating
                      ? t("session.signingIn")
                      : t("session.signIn")}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        <section className={styles.userFormCard}>
          <h2>{t("account.accountData")}</h2>

          <form
            className={styles.form}
            onSubmit={handleUpdateProfile}
            noValidate
          >
            <fieldset
              disabled={activeSection === "password"}
              className={styles.formFieldset}
            >
              <div className={styles.field}>
                <label htmlFor="account-name">{t("account.name")}</label>

                <input
                  id="account-name"
                  type="text"
                  value={name}
                  required
                  onFocus={() => setActiveSection("profile")}
                  onChange={(event) => {
                    setName(event.target.value);

                    if (profileFieldErrors.name) {
                      setProfileFieldErrors((current) => ({
                        ...current,
                        name: "",
                      }));
                    }
                  }}
                />
                {profileFieldErrors.name && (
                  <p className={styles.error} role="alert">
                    {t(profileFieldErrors.name)}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="account-email">{t("account.email")}</label>

                <input
                  id="account-email"
                  type="email"
                  value={admin.email}
                  disabled
                />
              </div>

              {error && <p className={styles.error}>{t(error)}</p>}

              {success && (
                <p
                  className={`${styles.successMessage} ${styles.formMessage}`}
                  role="status"
                >
                  {t(success)}
                </p>
              )}

              <div className={styles.userFormActions}>
                <button
                  type="submit"
                  className={styles.button}
                  disabled={isSaving}
                >
                  {isSaving ? t("account.saving") : t("account.saveChanges")}
                </button>
                <button
                  type="button"
                  className={styles.editButton}
                  disabled={isSaving}
                  onClick={handleCancelProfile}
                >
                  {t("account.cancel")}
                </button>
              </div>
            </fieldset>
          </form>
        </section>
        <section className={styles.userFormCard}>
          <h2>{t("account.changePassword")}</h2>

          <form
            className={styles.form}
            onSubmit={handleChangePassword}
            noValidate
          >
            <fieldset
              disabled={activeSection === "profile"}
              className={styles.formFieldset}
            >
              <div className={styles.field}>
                <label htmlFor="current-password">
                  {t("account.currentPassword")}
                </label>

                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onFocus={() => setActiveSection("password")}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);

                    if (passwordFieldErrors.currentPassword) {
                      setPasswordFieldErrors((current) => ({
                        ...current,
                        currentPassword: "",
                      }));
                    }
                  }}
                  autoComplete="current-password"
                  required
                />
                {passwordFieldErrors.currentPassword && (
                  <p className={styles.error} role="alert">
                    {t(passwordFieldErrors.currentPassword)}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="new-password">{t("account.newPassword")}</label>

                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onFocus={() => setActiveSection("password")}
                  onChange={(event) => {
                    setNewPassword(event.target.value);

                    if (passwordFieldErrors.newPassword) {
                      setPasswordFieldErrors((current) => ({
                        ...current,
                        newPassword: "",
                      }));
                    }
                  }}
                  autoComplete="new-password"
                  minLength={12}
                  required
                />
                {passwordFieldErrors.newPassword && (
                  <p className={styles.error} role="alert">
                    {t(passwordFieldErrors.newPassword)}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="confirm-password">
                  {t("account.confirmPassword")}
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onFocus={() => setActiveSection("password")}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);

                    if (passwordFieldErrors.confirmPassword) {
                      setPasswordFieldErrors((current) => ({
                        ...current,
                        confirmPassword: "",
                      }));
                    }
                  }}
                  autoComplete="new-password"
                  minLength={12}
                  required
                />
                {passwordFieldErrors.confirmPassword && (
                  <p className={styles.error} role="alert">
                    {t(passwordFieldErrors.confirmPassword)}
                  </p>
                )}
              </div>

              {passwordError && (
                <p className={styles.error}>{t(passwordError)}</p>
              )}

              {passwordSuccess && (
                <p
                  className={`${styles.successMessage} ${styles.formMessage}`}
                  role="status"
                >
                  {t(passwordSuccess)}
                </p>
              )}

              <div className={styles.userFormActions}>
                <button
                  type="submit"
                  className={styles.button}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword
                    ? t("account.changingPassword")
                    : t("account.changePassword")}
                </button>
                <button
                  type="button"
                  className={styles.editButton}
                  disabled={isSaving}
                  onClick={handleCancelProfile}
                >
                  {t("account.cancel")}
                </button>
              </div>
            </fieldset>
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
