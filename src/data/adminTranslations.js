export const ADMIN_LANGUAGES = ["pt", "es", "en"];

export const adminTranslations = {
  pt: {
    common: {
      back: "Voltar",
      logout: "Terminar sessão",
      signingOut: "A sair...",
    },
    layout: {
      title: "Caldo Verde · Administração",
      dashboardAriaLabel: "Dashboard da administração",
      language: "Idioma",
    },
    dashboard: {
      pageTitle: "Administração | Caldo Verde",
      title: "Administração",
      welcome: "Olá, {name}.",
      accountTitle: "A minha conta",
      accountDescription: "Alterar o nome e a palavra-passe da tua conta.",
      usersTitle: "Utilizadores",
      usersDescription:
        "Criar, editar, desativar e reativar utilizadores da administração.",
      menuTitle: "Menu",
      menuDescription:
        "Gerir categorias, subcategorias, pratos, traduções e preços.",
    },
    login: {
      pageTitle: "Administração | Caldo Verde",
      title: "Administração",
      subtitle: "Inicia sessão para aceder à administração.",
      email: "Email",
      password: "Palavra-passe",
      submit: "Entrar",
      submitting: "A entrar...",
      invalidCredentials: "Email ou palavra-passe incorretos.",
    },
    validation: {
      emailRequired: "O email é obrigatório.",
      emailInvalid: "Introduz um endereço de email válido.",
      passwordRequired: "A palavra-passe é obrigatória.",
      nameRequired: "O nome é obrigatório.",
      currentPasswordRequired: "A palavra-passe atual é obrigatória.",
      newPasswordRequired: "A nova palavra-passe é obrigatória.",
      confirmPasswordRequired:
        "A confirmação da nova palavra-passe é obrigatória.",
      passwordMinLength: "A palavra-passe deve ter pelo menos 12 caracteres.",
    },
    account: {
      pageTitle: "A minha conta | Caldo Verde",
      title: "A minha conta",
      subtitle: "Gerir os teus dados de acesso à administração.",

      accountData: "Dados da conta",
      name: "Nome",
      email: "Email",
      saveChanges: "Guardar alterações",
      saving: "A guardar...",

      updateSuccess: "Nome atualizado com sucesso.",
      updateFailed: "Não foi possível atualizar a conta.",

      changePassword: "Alterar a palavra-passe",
      currentPassword: "Palavra-passe atual",
      newPassword: "Nova palavra-passe",
      confirmPassword: "Confirmar nova palavra-passe",
      changingPassword: "A alterar...",
      passwordSuccess: "Palavra-passe alterada com sucesso.",
      passwordMismatch: "A confirmação da nova palavra-passe não coincide.",
      passwordChangeFailed: "Não foi possível alterar a palavra-passe.",
      currentPasswordIncorrect: "A palavra-passe atual está incorreta.",
    },

    session: {
      expiredTitle: "A sessão expirou.",
      expiredDescription:
        "As alterações dos formulários continuam preservadas. Volta a iniciar sessão para continuar.",
      reauthenticate: "Voltar a iniciar sessão",
      email: "Email",
      password: "Palavra-passe",
      cancel: "Cancelar",
      signIn: "Iniciar sessão",
      signingIn: "A iniciar sessão...",
      signInFailed: "Email ou palavra-passe incorretos.",
    },
  },

  es: {
    common: {
      back: "Volver",
      logout: "Cerrar sesión",
      signingOut: "Cerrando sesión...",
    },
    layout: {
      title: "Caldo Verde · Administración",
      dashboardAriaLabel: "Panel de administración",
      language: "Idioma",
    },
    dashboard: {
      pageTitle: "Administración | Caldo Verde",
      title: "Administración",
      welcome: "Hola, {name}.",
      accountTitle: "Mi cuenta",
      accountDescription: "Cambiar el nombre y la contraseña de tu cuenta.",
      usersTitle: "Usuarios",
      usersDescription:
        "Crear, editar, desactivar y reactivar usuarios de la administración.",
      menuTitle: "Menú",
      menuDescription:
        "Gestionar categorías, subcategorías, platos, traducciones y precios.",
    },
    login: {
      pageTitle: "Administración | Caldo Verde",
      title: "Administración",
      subtitle: "Inicia sesión para acceder a la administración.",
      email: "Email",
      password: "Contraseña",
      submit: "Entrar",
      submitting: "Entrando...",
      invalidCredentials: "El email o la contraseña son incorrectos.",
    },
    validation: {
      emailRequired: "El email es obligatorio.",
      emailInvalid: "Introduce una dirección de email válida.",
      passwordRequired: "La contraseña es obligatoria.",
      nameRequired: "El nombre es obligatorio.",
      currentPasswordRequired: "La contraseña actual es obligatoria.",
      newPasswordRequired: "La nueva contraseña es obligatoria.",
      confirmPasswordRequired:
        "La confirmación de la nueva contraseña es obligatoria.",
      passwordMinLength: "La contraseña debe tener al menos 12 caracteres.",
    },
    account: {
      pageTitle: "Mi cuenta | Caldo Verde",
      title: "Mi cuenta",
      subtitle: "Gestiona tus datos de acceso a la administración.",

      accountData: "Datos de la cuenta",
      name: "Nombre",
      email: "Email",
      saveChanges: "Guardar cambios",
      saving: "Guardando...",

      updateSuccess: "Nombre actualizado correctamente.",
      updateFailed: "No se pudo actualizar la cuenta.",

      changePassword: "Cambiar la contraseña",
      currentPassword: "Contraseña actual",
      newPassword: "Nueva contraseña",
      confirmPassword: "Confirmar nueva contraseña",
      changingPassword: "Cambiando...",
      passwordSuccess: "Contraseña cambiada correctamente.",
      passwordMismatch: "La confirmación de la nueva contraseña no coincide.",
      passwordChangeFailed: "No se pudo cambiar la contraseña.",
      currentPasswordIncorrect: "La contraseña actual es incorrecta.",
    },

    session: {
      expiredTitle: "La sesión ha caducado.",
      expiredDescription:
        "Los cambios de los formularios siguen guardados. Vuelve a iniciar sesión para continuar.",
      reauthenticate: "Volver a iniciar sesión",
      email: "Email",
      password: "Contraseña",
      cancel: "Cancelar",
      signIn: "Iniciar sesión",
      signingIn: "Iniciando sesión...",
      signInFailed: "El email o la contraseña son incorrectos.",
    },
  },

  en: {
    common: {
      back: "Back",
      logout: "Sign out",
      signingOut: "Signing out...",
    },
    layout: {
      title: "Caldo Verde · Administration",
      dashboardAriaLabel: "Administration dashboard",
      language: "Language",
    },
    dashboard: {
      pageTitle: "Administration | Caldo Verde",
      title: "Administration",
      welcome: "Hello, {name}.",
      accountTitle: "My account",
      accountDescription: "Change the name and password for your account.",
      usersTitle: "Users",
      usersDescription:
        "Create, edit, deactivate and reactivate administration users.",
      menuTitle: "Menu",
      menuDescription:
        "Manage categories, subcategories, dishes, translations and prices.",
    },
    login: {
      pageTitle: "Administration | Caldo Verde",
      title: "Administration",
      subtitle: "Sign in to access the administration area.",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      submitting: "Signing in...",
      invalidCredentials: "Invalid email or password.",
    },
    validation: {
      emailRequired: "Email is required.",
      emailInvalid: "Enter a valid email address.",
      passwordRequired: "Password is required.",
      nameRequired: "Name is required.",
      currentPasswordRequired: "Current password is required.",
      newPasswordRequired: "New password is required.",
      confirmPasswordRequired: "New password confirmation is required.",
      passwordMinLength: "Password must contain at least 12 characters.",
    },
    account: {
      pageTitle: "My account | Caldo Verde",
      title: "My account",
      subtitle: "Manage your administration access details.",

      accountData: "Account details",
      name: "Name",
      email: "Email",
      saveChanges: "Save changes",
      saving: "Saving...",

      updateSuccess: "Name updated successfully.",
      updateFailed: "Could not update the account.",

      changePassword: "Change password",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm new password",
      changingPassword: "Changing...",
      passwordSuccess: "Password changed successfully.",
      passwordMismatch: "The new password confirmation does not match.",
      passwordChangeFailed: "Could not change the password.",
      currentPasswordIncorrect: "The current password is incorrect.",
    },

    session: {
      expiredTitle: "Your session has expired.",
      expiredDescription:
        "Your form changes have been preserved. Sign in again to continue.",
      reauthenticate: "Sign in again",
      email: "Email",
      password: "Password",
      cancel: "Cancel",
      signIn: "Sign in",
      signingIn: "Signing in...",
      signInFailed: "Incorrect email or password.",
    },
  },
};
