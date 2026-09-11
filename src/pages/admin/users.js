import Head from "next/head";
import { useEffect, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminSession } from "../../server/getAdminSession";
import styles from "../../styles/Admin.module.css";
import { authClient } from "../../lib/authClient";

export default function AdminUsers({ admin }) {
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

  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      try {
        const response = await fetch("/api/admin/users");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Não foi possível carregar os utilizadores."
          );
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
  }

  function handleCancelCreate() {
    setIsCreating(false);
    setError("");
    setNewUser({
      name: "",
      email: "",
      password: "",
    });
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

  async function handleCreateUser(event) {
    event.preventDefault();

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
        throw new Error(data.error || "Não foi possível criar o utilizador.");
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
    setError("");
  }

  function handleCancelEdit() {
    setEditingUserId(null);
    setEditingName("");
    setError("");
  }

  async function handleUpdateUser(event, userId) {
    event.preventDefault();

    setIsUpdating(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingName,
        }),
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível atualizar o utilizador."
        );
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
          data.error || "Não foi possível alterar o estado do utilizador."
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

  async function handleReauthenticate(event) {
    event.preventDefault();

    setReauthError("");
    setIsReauthenticating(true);

    const { error: signInError } = await authClient.signIn.email({
      email: reauthEmail.trim(),
      password: reauthPassword,
    });

    if (signInError) {
      setReauthError(signInError.message ?? "Não foi possível iniciar sessão.");

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
        <title>Utilizadores | Caldo Verde</title>

        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout admin={admin}>
        <section className={styles.dashboardHeading}>
          <div>
            <h1>Utilizadores</h1>

            <p>Gerir os utilizadores com acesso à administração.</p>
          </div>

          {!isCreating && (
            <button
              type="button"
              className={styles.button}
              onClick={() => setIsCreating(true)}
            >
              Adicionar utilizador
            </button>
          )}
        </section>

        {isCreating && (
          <section className={styles.userFormCard}>
            <h2>Novo utilizador</h2>

            <form className={styles.form} onSubmit={handleCreateUser}>
              <div className={styles.field}>
                <label htmlFor="new-user-name">Nome</label>

                <input
                  id="new-user-name"
                  name="name"
                  type="text"
                  value={newUser.name}
                  onChange={handleNewUserChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="new-user-email">Email</label>

                <input
                  id="new-user-email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="new-user-password">Palavra-passe inicial</label>

                <input
                  id="new-user-password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  minLength={12}
                  required
                />
              </div>

              <div className={styles.userFormActions}>
                <button
                  type="submit"
                  className={styles.button}
                  disabled={isSaving}
                >
                  {isSaving ? "A criar..." : "Criar utilizador"}
                </button>

                <button
                  type="button"
                  className={styles.editButton}
                  disabled={isSaving}
                  onClick={handleCancelCreate}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}
        {isSessionExpired && (
          <div className={styles.sessionExpiredNotice} role="alert">
            <strong>A sessão expirou.</strong>

            <p>
              As alterações do formulário continuam preservadas. Volta a iniciar
              sessão para continuar.
            </p>

            {!showReauthForm ? (
              <button
                className={styles.saveButton}
                type="button"
                onClick={() => setShowReauthForm(true)}
              >
                Voltar a iniciar sessão
              </button>
            ) : (
              <form
                className={styles.reauthForm}
                onSubmit={handleReauthenticate}
              >
                <label>
                  <span>Email</span>

                  <input
                    className={styles.editorInput}
                    type="email"
                    autoComplete="username"
                    required
                    disabled={isReauthenticating}
                    value={reauthEmail}
                    onChange={(event) => setReauthEmail(event.target.value)}
                  />
                </label>

                <label>
                  <span>Password</span>

                  <input
                    className={styles.editorInput}
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={isReauthenticating}
                    value={reauthPassword}
                    onChange={(event) => setReauthPassword(event.target.value)}
                  />
                </label>

                {reauthError && (
                  <p className={styles.errorMessage}>{reauthError}</p>
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
                    Cancelar
                  </button>

                  <button
                    className={styles.saveButton}
                    type="submit"
                    disabled={isReauthenticating}
                  >
                    {isReauthenticating
                      ? "A iniciar sessão..."
                      : "Iniciar sessão"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        {error && <p className={styles.error}>{error}</p>}
        {statusUser && (
          <div className={styles.confirmationCard}>
            <div>
              <h2>
                {statusUser.banned
                  ? "Reativar utilizador"
                  : "Desativar utilizador"}
              </h2>

              <p>
                {statusUser.banned
                  ? `Queres reativar o acesso de ${statusUser.name}?`
                  : `Queres mesmo desativar o acesso de ${statusUser.name}?`}
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
                {changingStatusUserId === statusUser.id
                  ? "A processar..."
                  : statusUser.banned
                    ? "Reativar"
                    : "Desativar"}
              </button>

              <button
                type="button"
                className={styles.editButton}
                disabled={changingStatusUserId === statusUser.id}
                onClick={handleCancelUserStatusChange}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {isLoading ? (
          <p>A carregar utilizadores...</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Função</th>
                  <th>Estado</th>
                  <th>Ações</th>
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
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          required
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td>{user.email}</td>

                    <td>
                      {user.role === "admin" ? "Administrador" : user.role}
                    </td>

                    <td>
                      <span
                        className={
                          user.banned
                            ? styles.statusHidden
                            : styles.statusVisible
                        }
                      >
                        {user.banned ? "Desativado" : "Ativo"}
                      </span>
                    </td>

                    <td>
                      {editingUserId === user.id ? (
                        <form
                          className={styles.userFormActions}
                          onSubmit={(event) => handleUpdateUser(event, user.id)}
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
                            {isUpdating ? "A guardar..." : "Guardar"}
                          </button>

                          <button
                            type="button"
                            className={styles.editButton}
                            disabled={isUpdating}
                            onClick={handleCancelEdit}
                          >
                            Cancelar
                          </button>
                        </form>
                      ) : (
                        <div className={styles.userFormActions}>
                          <button
                            type="button"
                            className={styles.editButton}
                            onClick={() => handleStartEdit(user)}
                          >
                            Editar
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
                                ? "A processar..."
                                : user.banned
                                  ? "Reativar"
                                  : "Desativar"}
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
