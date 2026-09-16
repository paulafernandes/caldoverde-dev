import Head from "next/head";
import { useEffect, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminSession } from "../../server/getAdminSession";
import styles from "../../styles/Admin.module.css";
import { authClient } from "../../lib/authClient";
import { useAdminLanguage } from "../../context/AdminLanguageContext";
import { getAdminApiErrorKey } from "../../lib/adminApiError";

export default function AdminUsers({ admin }) {
  const { t } = useAdminLanguage();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [changingStatusUserId, setChangingStatusUserId] = useState(null);
  const [statusUser, setStatusUser] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const [reauthEmail, setReauthEmail] = useState(admin.email);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [showReauthForm, setShowReauthForm] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [newUserFieldErrors, setNewUserFieldErrors] = useState({});
  const [editingNameError, setEditingNameError] = useState("");
  const [reauthFieldErrors, setReauthFieldErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      try {
        const response = await fetch("/api/admin/users");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(getAdminApiErrorKey(data.error, "users.loadFailed"));
        }

        if (isMounted) {
          setUsers(data.users ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleNewUserChange(event) {
    const { name, value } = event.target;

    setNewUser((current) => ({
      ...current,
      [name]: value,
    }));

    if (newUserFieldErrors[name]) {
      setNewUserFieldErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  }

  function handleCancelCreate() {
    setNewUserFieldErrors({});
    setIsCreating(false);
    setError("");
    setNewUser({
      name: "",
      email: "",
      password: "",
    });

    setNewUserFieldErrors({});
    setIsCreating(false);
  }

  useEffect(() => {
    function handleSessionExpired() {
      setIsSessionExpired(true);
      setError("");

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

  function validateNewUserForm() {
    const errors = {};
    const trimmedName = newUser.name.trim();
    const trimmedEmail = newUser.email.trim();

    if (!trimmedName) {
      errors.name = "validation.nameRequired";
    }

    if (!trimmedEmail) {
      errors.email = "validation.emailRequired";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "validation.emailInvalid";
    }

    if (!newUser.password) {
      errors.password = "validation.passwordRequired";
    } else if (newUser.password.length < 12) {
      errors.password = "validation.passwordMinLength";
    }

    setNewUserFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleCreateUser(event) {
    event.preventDefault();

    setError("");

    if (!validateNewUserForm()) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getAdminApiErrorKey(data.error, "users.createFailed"));
      }

      setUsers((current) =>
        [...current, data.user].sort((a, b) => a.name.localeCompare(b.name))
      );

      setNewUser({
        name: "",
        email: "",
        password: "",
      });

      setIsCreating(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }
  function handleStartEdit(user) {
    setEditingUserId(user.id);
    setEditingName(user.name);
    setEditingNameError("");
    setError("");
  }

  function handleCancelEdit() {
    setEditingUserId(null);
    setEditingName("");
    setEditingNameError("");
    setError("");
  }

  function validateEditingName() {
    if (!editingName.trim()) {
      setEditingNameError("validation.nameRequired");
      return false;
    }

    setEditingNameError("");
    return true;
  }

  async function handleUpdateUser(event, userId) {
    event.preventDefault();

    setError("");

    if (!validateEditingName()) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingName.trim(),
        }),
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getAdminApiErrorKey(data.error, "users.updateFailed"));
      }

      setUsers((current) =>
        current
          .map((user) =>
            user.id === userId
              ? {
                  ...user,
                  name: editingName.trim(),
                }
              : user
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingUserId(null);
      setEditingName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  }
  function handleRequestUserStatusChange(user) {
    setStatusUser(user);
    setError("");
  }

  function handleCancelUserStatusChange() {
    setStatusUser(null);
  }
  async function handleChangeUserStatus(user) {
    const action = user.banned ? "activate" : "deactivate";

    setChangingStatusUserId(user.id);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${user.id}/${action}`, {
        method: "POST",
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getAdminApiErrorKey(data.error, "users.statusChangeFailed")
        );
      }

      setUsers((current) =>
        current.map((currentUser) =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                banned: !user.banned,
              }
            : currentUser
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingStatusUserId(null);
    }
  }
  function handleUnauthorizedResponse(response) {
    if (response.status !== 401) {
      return false;
    }

    window.dispatchEvent(new Event("admin-session-expired"));

    return true;
  }

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
  return (
    <>
      <Head>
        <title>{t("users.pageTitle")}</title>

        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout admin={admin}>
        <section className={styles.dashboardHeading}>
          <div>
            <h1>{t("users.title")}</h1>

            <p>{t("users.subtitle")}</p>
          </div>

          {!isCreating && (
            <button
              type="button"
              className={styles.button}
              onClick={() => setIsCreating(true)}
            >
              {t("users.addUser")}
            </button>
          )}
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
                  {newUserFieldErrors.email && (
                    <p className={styles.error} role="alert">
                      {t(newUserFieldErrors.email)}
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
                  {newUserFieldErrors.password && (
                    <p className={styles.error} role="alert">
                      {t(newUserFieldErrors.password)}
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
        {isCreating && (
          <section className={styles.userFormCard}>
            <h2>{t("users.newUser")}</h2>

            <form
              className={styles.form}
              onSubmit={handleCreateUser}
              noValidate
            >
              <div className={styles.field}>
                <label htmlFor="new-user-name">{t("users.name")}</label>

                <input
                  id="new-user-name"
                  name="name"
                  type="text"
                  value={newUser.name}
                  onChange={handleNewUserChange}
                  required
                />
                {newUserFieldErrors.name && (
                  <p className={styles.error} role="alert">
                    {t(newUserFieldErrors.name)}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="new-user-email">{t("users.email")}</label>

                <input
                  id="new-user-email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  required
                />
                {newUserFieldErrors.email && (
                  <p className={styles.error} role="alert">
                    {t(newUserFieldErrors.email)}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="new-user-password">
                  {t("users.initialPassword")}
                </label>

                <input
                  id="new-user-password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  minLength={12}
                  required
                />
                {newUserFieldErrors.password && (
                  <p className={styles.error} role="alert">
                    {t(newUserFieldErrors.password)}
                  </p>
                )}
              </div>

              <div className={styles.userFormActions}>
                <button
                  type="submit"
                  className={styles.button}
                  disabled={isSaving}
                >
                  {isSaving ? t("users.creating") : t("users.create")}
                </button>

                <button
                  type="button"
                  className={styles.editButton}
                  disabled={isSaving}
                  onClick={handleCancelCreate}
                >
                  {t("users.cancel")}
                </button>
              </div>
            </form>
          </section>
        )}

        {error && <p className={styles.error}>{t(error)}</p>}
        {statusUser && (
          <div className={styles.confirmationCard}>
            <div>
              <h2>
                {statusUser.banned
                  ? t("users.activateTitle")
                  : t("users.deactivateTitle")}
              </h2>

              <p>
                {statusUser.banned
                  ? t("users.activateQuestion", {
                      name: statusUser.name,
                    })
                  : t("users.deactivateQuestion", {
                      name: statusUser.name,
                    })}
              </p>
            </div>

            <div className={styles.userFormActions}>
              <button
                type="button"
                className={
                  statusUser.banned ? styles.button : styles.dangerButton
                }
                disabled={changingStatusUserId === statusUser.id}
                onClick={async () => {
                  await handleChangeUserStatus(statusUser);
                  setStatusUser(null);
                }}
              >
                {statusUser.banned
                  ? t("users.activateQuestion", {
                      name: statusUser.name,
                    })
                  : t("users.deactivateQuestion", {
                      name: statusUser.name,
                    })}
              </button>

              <button
                type="button"
                className={styles.editButton}
                disabled={changingStatusUserId === statusUser.id}
                onClick={handleCancelUserStatusChange}
              >
                {t("users.cancel")}
              </button>
            </div>
          </div>
        )}
        {isLoading ? (
          <p>{t("users.loading")}</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("users.name")}</th>
                  <th>{t("users.email")}</th>
                  <th>{t("users.role")}</th>
                  <th>{t("users.status")}</th>
                  <th>{t("users.actions")}</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(event) => {
                            setEditingName(event.target.value);

                            if (editingNameError) {
                              setEditingNameError("");
                            }
                          }}
                          required
                        />
                      ) : (
                        user.name
                      )}
                      {editingUserId === user.id && editingNameError && (
                        <p className={styles.error} role="alert">
                          {t(editingNameError)}
                        </p>
                      )}
                    </td>
                    <td>{user.email}</td>

                    <td>
                      {user.role === "admin"
                        ? t("users.administrator")
                        : user.role}
                    </td>

                    <td>
                      <span
                        className={
                          user.banned
                            ? styles.statusHidden
                            : styles.statusVisible
                        }
                      >
                        {user.banned
                          ? t("users.deactivated")
                          : t("users.active")}
                      </span>
                    </td>

                    <td>
                      {editingUserId === user.id ? (
                        <form
                          className={styles.userFormActions}
                          onSubmit={(event) => handleUpdateUser(event, user.id)}
                          noValidate
                        >
                          <button
                            type="submit"
                            className={
                              user.banned
                                ? styles.editButton
                                : styles.dangerOutlineButton
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating ? t("users.saving") : t("users.save")}
                          </button>

                          <button
                            type="button"
                            className={styles.editButton}
                            disabled={isUpdating}
                            onClick={handleCancelEdit}
                          >
                            {t("users.cancel")}
                          </button>
                        </form>
                      ) : (
                        <div className={styles.userFormActions}>
                          <button
                            type="button"
                            className={styles.editButton}
                            onClick={() => handleStartEdit(user)}
                          >
                            {t("users.edit")}
                          </button>

                          {user.id !== admin.id && (
                            <button
                              type="button"
                              className={styles.editButton}
                              disabled={changingStatusUserId === user.id}
                              onClick={() =>
                                handleRequestUserStatusChange(user)
                              }
                            >
                              {changingStatusUserId === user.id
                                ? t("users.processing")
                                : user.banned
                                  ? t("users.activate")
                                  : t("users.deactivate")}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    },
  };
}
