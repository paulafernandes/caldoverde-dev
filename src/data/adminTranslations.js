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
      settingsTitle: "Configurações do negócio",
      settingsDescription:
        "Gerir os dados gerais, idiomas, SEO e redes sociais do negócio.",
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
      cancel: "Cancelar",
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
    users: {
      pageTitle: "Utilizadores | Caldo Verde",
      title: "Utilizadores",
      subtitle: "Gerir os utilizadores com acesso à administração.",

      addUser: "Adicionar utilizador",
      newUser: "Novo utilizador",
      name: "Nome",
      email: "Email",
      initialPassword: "Palavra-passe inicial",

      create: "Criar utilizador",
      creating: "A criar...",
      edit: "Editar",
      save: "Guardar",
      saving: "A guardar...",
      cancel: "Cancelar",

      loadFailed: "Não foi possível carregar os utilizadores.",
      createFailed: "Não foi possível criar o utilizador.",
      updateFailed: "Não foi possível atualizar o utilizador.",
      statusChangeFailed: "Não foi possível alterar o estado do utilizador.",

      activateTitle: "Reativar utilizador",
      deactivateTitle: "Desativar utilizador",
      activateQuestion: "Queres reativar o acesso de {name}?",
      deactivateQuestion: "Queres mesmo desativar o acesso de {name}?",

      activate: "Reativar",
      deactivate: "Desativar",
      processing: "A processar...",

      loading: "A carregar utilizadores...",

      role: "Função",
      status: "Estado",
      actions: "Ações",
      administrator: "Administrador",
      active: "Ativo",
      deactivated: "Desativado",
    },
    menu: {
      common: {
        name: "Nome",
        cancel: "Cancelar",
        saving: "A guardar...",
        deleting: "A eliminar...",
        deletePermanently: "Eliminar permanentemente",
        serverError: "Não foi possível comunicar com o servidor.",
      },

      subcategory: {
        add: "Adicionar subcategoria",
        edit: "Editar subcategoria",
        delete: "Eliminar subcategoria",
        create: "Criar subcategoria",
        save: "Guardar subcategoria",

        visible: "Subcategoria visível no site público",
        fallbackName: "Subcategoria",

        saveFailed: "Não foi possível guardar a subcategoria.",
        deleteFailed: "Não foi possível eliminar a subcategoria.",
        operationFailed: "Não foi possível concluir a operação.",

        deleteQuestion: "Eliminar “{name}”?",
        deleteDescription:
          "Os pratos desta subcategoria não serão eliminados. Ficarão sem subcategoria.",
        keep: "Manter subcategoria",
        nameRequired:
          "Preenche o nome da subcategoria em pelo menos um idioma.",
        fallbackWithPosition: "Subcategoria {position}",
      },
      item: {
        add: "Adicionar prato",
        edit: "Editar",
        delete: "Eliminar prato",
        create: "Criar prato",
        save: "Guardar alterações",
        editDescription: "Altera os textos, o preço ou a visibilidade.",

        fallbackName: "Prato #{position}",

        description: "Descrição",

        subcategory: "Subcategoria",
        subcategoryDescription: "Seleciona a subcategoria deste prato.",
        noSubcategory: "Sem subcategoria",

        image: "Imagem do prato",
        imagePreviewAlt: "Pré-visualização do prato",
        imageHelp: "Imagem opcional. PNG, JPEG ou WebP. Máximo de 5 MB.",
        uploadingImage: "A carregar imagem...",
        removeImage: "Remover imagem do prato",
        removeImageQuestion: "Remover a imagem do prato?",
        removeImageDescription:
          "A imagem será removida quando guardares o prato.",
        keepImage: "Manter imagem",
        confirmRemoveImage: "Remover imagem",

        invalidImageType: "Seleciona uma imagem PNG, JPEG ou WebP.",
        imageTooLarge: "A imagem não pode ultrapassar 5 MB.",
        imageUploadFailed: "Não foi possível carregar a imagem.",

        price: "Preço / informação de preço",
        pricePlaceholder: "Ex.: Meia dose: 8 € · Dose: 14 €",
        priceHelp: "Podes escrever um preço simples ou várias opções.",

        visible: "Visível",

        saveFailed: "Não foi possível guardar o prato.",
        deleteFailed: "Não foi possível eliminar o prato.",

        deleteQuestion: "Eliminar “{name}”?",
        deleteDescription:
          "Esta ação é permanente. As traduções do prato também serão eliminadas.",
        keep: "Manter prato",
        nameRequired: "Preenche o nome do prato em pelo menos um idioma.",
        hidden: "Oculto",
      },
      category: {
        add: "Adicionar categoria",
        edit: "Editar categoria",
        delete: "Eliminar categoria",
        create: "Criar categoria",
        save: "Guardar categoria",

        tabName: "Nome do separador",
        title: "Título da categoria",
        highlightText: "Texto em destaque (opcional)",

        subcategories: "Subcategorias",
        subcategoriesDescription:
          "Organiza os pratos desta categoria em secções.",
        subcategoriesOptional:
          "As subcategorias são opcionais. Podes adicioná-las agora ou mais tarde.",
        noSubcategories: "Esta categoria ainda não tem subcategorias.",

        visible: "Visível",
        hidden: "Oculta",
        editSubcategory: "Editar",

        changeSubcategoryOrder: "Alterar ordem de {name}",
        moveSubcategoryUp: "Mover {name} para cima",
        moveSubcategoryDown: "Mover {name} para baixo",

        image: "Imagem da categoria",
        imagePreviewAlt: "Pré-visualização da categoria",
        imageHelp: "Imagem opcional. PNG, JPEG ou WebP. Máximo de 5 MB.",
        uploadingImage: "A carregar imagem...",
        removeImage: "Remover imagem da categoria",
        removeImageQuestion: "Remover a imagem da categoria?",
        removeImageDescription:
          "A imagem será removida quando guardares a categoria.",
        keepImage: "Manter imagem",
        confirmRemoveImage: "Remover imagem",

        invalidImageType: "Seleciona uma imagem PNG, JPEG ou WebP.",
        imageTooLarge: "A imagem não pode ultrapassar 5 MB.",
        imageUploadFailed: "Não foi possível carregar a imagem.",
        invalidImagePath:
          "A imagem deve estar em /assets/images/ ou /uploads/.",

        visibleOnSite: "Categoria visível no site público",

        saveFailed: "Não foi possível guardar a categoria.",
        deleteFailed: "Não foi possível eliminar a categoria.",
        orderFailed: "Não foi possível alterar a ordem da subcategoria.",

        deleteQuestion: "Eliminar “{name}”?",
        deleteDescription:
          "Esta ação é permanente e só será permitida se a categoria estiver vazia.",
        keep: "Manter categoria",

        subcategoryOrderUpdated: "A ordem das subcategorias foi atualizada.",
        subcategoryUpdated: "A subcategoria foi atualizada com sucesso.",
        subcategoryDeleted: "A subcategoria foi eliminada com sucesso.",
        subcategoryCreated: "A nova subcategoria foi criada com sucesso.",
        nameAndTitleRequired:
          "Preenche o nome do separador e o título da categoria em pelo menos um idioma.",
        deleteNotEmpty:
          "Não é possível eliminar esta categoria porque ainda tem pratos associados.",
      },
      page: {
        pageTitle: "Ementa | Administração",
        title: "Gestão da ementa",
        subtitle: "Categorias, traduções, pratos e preços.",
        summaryAria: "Resumo da ementa",

        categorySingular: "categoria",
        categoryPlural: "categorias",
        dishSingular: "prato",
        dishPlural: "pratos",

        addCategory: "Adicionar categoria",
        closeNewCategory: "Fechar nova categoria",

        newItemCreated: "O novo prato foi criado com sucesso.",
        categoryUpdated: "A categoria {name} foi atualizada com sucesso.",
        itemUpdated: "O prato {name} foi atualizado com sucesso.",
        itemDeleted: "O prato {name} foi eliminado com sucesso.",
        categoryDeleted: "A categoria {name} foi eliminada com sucesso.",

        categoryCreated: "A nova categoria foi criada com sucesso.",
        categoryCreatedAddSubcategory:
          "A categoria foi criada. Adiciona agora a subcategoria.",

        itemOrderFailed: "Não foi possível alterar a ordem do prato.",
        categoryOrderFailed: "Não foi possível alterar a ordem da categoria.",
        noCategories: "A ementa ainda não tem categorias.",
        noItems: "Esta categoria ainda não tem pratos.",

        changeCategoryOrder: "Alterar ordem de {name}",
        moveCategoryUp: "Mover {name} para cima",
        moveCategoryDown: "Mover {name} para baixo",

        closeCategoryEdit: "Fechar edição",
        openCategory: "Abrir categoria",
        closeCategory: "Fechar categoria",

        closeNewItem: "Fechar novo prato",

        changeItemOrder: "Alterar ordem de {name}",
        moveItemUp: "Mover {name} para cima",
        moveItemDown: "Mover {name} para baixo",

        pending: "Pendente",
        close: "Fechar",
      },
    },
    apiErrors: {
      categoryNotFound: "A categoria não foi encontrada.",
      categoryNotEmpty:
        "Não é possível eliminar esta categoria porque ainda tem pratos associados.",

      subcategoryNotFound: "A subcategoria não foi encontrada.",
      subcategoryCategoryMismatch:
        "A subcategoria selecionada não pertence a esta categoria.",

      itemNotFound: "O prato não foi encontrado.",

      imageTooLarge: "A imagem não pode ultrapassar 5 MB.",
      invalidImageType: "Seleciona uma imagem PNG, JPEG ou WebP.",
      invalidImageContent:
        "O ficheiro selecionado não contém uma imagem válida.",
      imageProcessingFailed: "Não foi possível processar a imagem.",
      imageUploadFailed: "Não foi possível carregar a imagem.",

      invalidCategoryData: "Os dados da categoria são inválidos.",
      invalidSubcategoryData: "Os dados da subcategoria são inválidos.",
      invalidItemData: "Os dados do prato são inválidos.",

      invalidCategoryOrder: "A ordenação da categoria é inválida.",
      invalidSubcategoryOrder: "A ordenação da subcategoria é inválida.",
      invalidItemOrder: "A ordenação do prato é inválida.",

      categoryCreateFailed: "Não foi possível criar a categoria.",
      categoryUpdateFailed: "Não foi possível atualizar a categoria.",
      categoryDeleteFailed: "Não foi possível eliminar a categoria.",
      categoryOrderFailed: "Não foi possível alterar a ordem da categoria.",

      subcategoryCreateFailed: "Não foi possível criar a subcategoria.",
      subcategoryUpdateFailed: "Não foi possível atualizar a subcategoria.",
      subcategoryDeleteFailed: "Não foi possível eliminar a subcategoria.",
      subcategoryOrderFailed:
        "Não foi possível alterar a ordem da subcategoria.",

      itemCreateFailed: "Não foi possível criar o prato.",
      itemUpdateFailed: "Não foi possível atualizar o prato.",
      itemDeleteFailed: "Não foi possível eliminar o prato.",
      itemOrderFailed: "Não foi possível alterar a ordem do prato.",

      userListFailed: "Não foi possível carregar os utilizadores.",
      invalidUserData: "Os dados do utilizador são inválidos.",
      invalidUserId: "O utilizador selecionado é inválido.",
      userCreateFailed: "Não foi possível criar o utilizador.",
      userUpdateFailed: "Não foi possível atualizar o utilizador.",
      userActivateFailed: "Não foi possível reativar o utilizador.",
      userDeactivateFailed: "Não foi possível desativar o utilizador.",
      cannotDeactivateSelf: "Não podes desativar a tua própria conta.",
    },
    settings: {
      pageTitle: "Configurações do negócio | Administração",
      title: "Configurações do negócio",
      subtitle: "Gerir os dados gerais e a presença online do negócio.",
      generalData: "Dados gerais",
      name: "Nome",
      email: "Email",
      phone: "Telefone",
      addressLine1: "Morada",
      addressLine2: "Complemento da morada",
      postalCode: "Código postal",
      city: "Cidade",
      countryCode: "País",
      primaryActionUrl: "URL da ação principal",
      save: "Guardar alterações",
      saving: "A guardar...",
      cancel: "Cancelar",
      saveSuccess: "Os dados do negócio foram atualizados com sucesso.",
      saveFailed: "Não foi possível atualizar os dados do negócio.",
      nameRequired: "O nome do negócio é obrigatório.",
      nameTooLong: "O nome não pode ultrapassar 160 caracteres.",
      invalidEmail: "Introduz um endereço de email válido.",
      emailTooLong: "O email é demasiado longo.",
      phoneTooLong: "O telefone não pode ultrapassar 50 caracteres.",
      addressLine1TooLong: "A morada não pode ultrapassar 200 caracteres.",
      addressLine2TooLong:
        "O complemento da morada não pode ultrapassar 200 caracteres.",
      addressLine2Optional: "Complemento da morada (opcional)",
      postalCodeTooLong: "O código postal não pode ultrapassar 30 caracteres.",
      cityTooLong: "A cidade não pode ultrapassar 120 caracteres.",
      invalidCountryCode:
        "O país deve ser indicado com um código de 2 letras, por exemplo ES.",
      invalidUrl: "Introduz um URL válido.",
      urlTooLong: "O URL é demasiado longo.",
      emailRequired: "O email é obrigatório.",
      phoneRequired: "O telefone é obrigatório.",
      addressRequired: "A morada é obrigatória.",
      postalCodeRequired: "O código postal é obrigatório.",
      cityRequired: "A cidade é obrigatória.",
      countryRequired: "O país é obrigatório.",
      taxId: "NIF",
      taxIdRequired: "O NIF é obrigatório.",
      taxIdTooLong: "O NIF não pode ultrapassar 50 caracteres.",

      fiscalData: "Dados fiscais",
      fiscalAddressSameAsBusiness:
        "A morada fiscal é igual à morada do estabelecimento",
      fiscalAddressLine1: "Morada fiscal",
      fiscalAddressLine2: "Complemento da morada fiscal (opcional)",
      fiscalPostalCode: "Código postal fiscal",
      fiscalCity: "Cidade",
      fiscalCountryCode: "País",

      fiscalAddressRequired: "A morada fiscal é obrigatória.",
      fiscalAddressTooLong:
        "A morada fiscal não pode ultrapassar 200 caracteres.",
      fiscalAddressLine2TooLong:
        "O complemento da morada fiscal não pode ultrapassar 200 caracteres.",
      fiscalPostalCodeRequired: "O código postal fiscal é obrigatório.",
      fiscalPostalCodeTooLong:
        "O código postal fiscal não pode ultrapassar 30 caracteres.",
      fiscalCityRequired: "A cidade da morada fiscal é obrigatória.",
      fiscalCityTooLong:
        "A cidade da morada fiscal não pode ultrapassar 120 caracteres.",
      fiscalCountryRequired: "O país da morada fiscal é obrigatório.",
      invalidFiscalCountryCode:
        "O país deve ser indicado com um código de 2 letras, por exemplo ES.",
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
      settingsTitle: "Configuración del negocio",
      settingsDescription:
        "Gestionar los datos generales, idiomas, SEO y redes sociales del negocio.",
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
      cancel: "Cancelar",
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
    users: {
      pageTitle: "Usuarios | Caldo Verde",
      title: "Usuarios",
      subtitle: "Gestionar los usuarios con acceso a la administración.",

      addUser: "Añadir usuario",
      newUser: "Nuevo usuario",
      name: "Nombre",
      email: "Email",
      initialPassword: "Contraseña inicial",

      create: "Crear usuario",
      creating: "Creando...",
      edit: "Editar",
      save: "Guardar",
      saving: "Guardando...",
      cancel: "Cancelar",

      loadFailed: "No se pudieron cargar los usuarios.",
      createFailed: "No se pudo crear el usuario.",
      updateFailed: "No se pudo actualizar el usuario.",
      statusChangeFailed: "No se pudo cambiar el estado del usuario.",

      activateTitle: "Reactivar usuario",
      deactivateTitle: "Desactivar usuario",
      activateQuestion: "¿Quieres reactivar el acceso de {name}?",
      deactivateQuestion: "¿Quieres desactivar el acceso de {name}?",

      activate: "Reactivar",
      deactivate: "Desactivar",
      processing: "Procesando...",

      loading: "Cargando usuarios...",

      role: "Función",
      status: "Estado",
      actions: "Acciones",
      administrator: "Administrador",
      active: "Activo",
      deactivated: "Desactivado",
    },
    menu: {
      common: {
        name: "Nombre",
        cancel: "Cancelar",
        saving: "Guardando...",
        deleting: "Eliminando...",
        deletePermanently: "Eliminar permanentemente",
        serverError: "No se pudo comunicar con el servidor.",
      },

      subcategory: {
        add: "Añadir subcategoría",
        edit: "Editar subcategoría",
        delete: "Eliminar subcategoría",
        create: "Crear subcategoría",
        save: "Guardar subcategoría",

        visible: "Subcategoría visible en el sitio público",
        fallbackName: "Subcategoría",

        saveFailed: "No se pudo guardar la subcategoría.",
        deleteFailed: "No se pudo eliminar la subcategoría.",
        operationFailed: "No se pudo completar la operación.",

        deleteQuestion: "¿Eliminar “{name}”?",
        deleteDescription:
          "Los platos de esta subcategoría no se eliminarán. Quedarán sin subcategoría.",
        keep: "Mantener subcategoría",
        nameRequired:
          "Introduce el nombre de la subcategoría en al menos un idioma.",
        fallbackWithPosition: "Subcategoría {position}",
      },
      item: {
        add: "Añadir plato",
        edit: "Editar",
        delete: "Eliminar plato",
        create: "Crear plato",
        save: "Guardar cambios",
        editDescription: "Modifica los textos, el precio o la visibilidad.",

        fallbackName: "Plato #{position}",

        description: "Descripción",

        subcategory: "Subcategoría",
        subcategoryDescription: "Selecciona la subcategoría de este plato.",
        noSubcategory: "Sin subcategoría",

        image: "Imagen del plato",
        imagePreviewAlt: "Vista previa del plato",
        imageHelp: "Imagen opcional. PNG, JPEG o WebP. Máximo de 5 MB.",
        uploadingImage: "Cargando imagen...",
        removeImage: "Eliminar imagen del plato",
        removeImageQuestion: "¿Eliminar la imagen del plato?",
        removeImageDescription:
          "La imagen se eliminará cuando guardes el plato.",
        keepImage: "Mantener imagen",
        confirmRemoveImage: "Eliminar imagen",

        invalidImageType: "Selecciona una imagen PNG, JPEG o WebP.",
        imageTooLarge: "La imagen no puede superar los 5 MB.",
        imageUploadFailed: "No se pudo cargar la imagen.",

        price: "Precio / información de precio",
        pricePlaceholder: "Ej.: Media ración: 8 € · Ración: 14 €",
        priceHelp: "Puedes escribir un precio simple o varias opciones.",

        visible: "Visible",

        saveFailed: "No se pudo guardar el plato.",
        deleteFailed: "No se pudo eliminar el plato.",

        deleteQuestion: "¿Eliminar “{name}”?",
        deleteDescription:
          "Esta acción es permanente. Las traducciones del plato también se eliminarán.",
        keep: "Mantener plato",
        nameRequired: "Introduce el nombre del plato en al menos un idioma.",
        hidden: "Oculto",
      },
      category: {
        add: "Añadir categoría",
        edit: "Editar categoría",
        delete: "Eliminar categoría",
        create: "Crear categoría",
        save: "Guardar categoría",

        tabName: "Nombre de la pestaña",
        title: "Título de la categoría",
        highlightText: "Texto destacado (opcional)",

        subcategories: "Subcategorías",
        subcategoriesDescription:
          "Organiza los platos de esta categoría en secciones.",
        subcategoriesOptional:
          "Las subcategorías son opcionales. Puedes añadirlas ahora o más tarde.",
        noSubcategories: "Esta categoría todavía no tiene subcategorías.",

        visible: "Visible",
        hidden: "Oculta",
        editSubcategory: "Editar",

        changeSubcategoryOrder: "Cambiar el orden de {name}",
        moveSubcategoryUp: "Mover {name} hacia arriba",
        moveSubcategoryDown: "Mover {name} hacia abajo",

        image: "Imagen de la categoría",
        imagePreviewAlt: "Vista previa de la categoría",
        imageHelp: "Imagen opcional. PNG, JPEG o WebP. Máximo de 5 MB.",
        uploadingImage: "Cargando imagen...",
        removeImage: "Eliminar imagen de la categoría",
        removeImageQuestion: "¿Eliminar la imagen de la categoría?",
        removeImageDescription:
          "La imagen se eliminará cuando guardes la categoría.",
        keepImage: "Mantener imagen",
        confirmRemoveImage: "Eliminar imagen",

        invalidImageType: "Selecciona una imagen PNG, JPEG o WebP.",
        imageTooLarge: "La imagen no puede superar los 5 MB.",
        imageUploadFailed: "No se pudo cargar la imagen.",
        invalidImagePath:
          "La imagen debe estar en /assets/images/ o /uploads/.",

        visibleOnSite: "Categoría visible en el sitio público",

        saveFailed: "No se pudo guardar la categoría.",
        deleteFailed: "No se pudo eliminar la categoría.",
        orderFailed: "No se pudo cambiar el orden de la subcategoría.",

        deleteQuestion: "¿Eliminar “{name}”?",
        deleteDescription:
          "Esta acción es permanente y solo se permitirá si la categoría está vacía.",
        keep: "Mantener categoría",

        subcategoryOrderUpdated:
          "El orden de las subcategorías se ha actualizado.",
        subcategoryUpdated: "La subcategoría se ha actualizado correctamente.",
        subcategoryDeleted: "La subcategoría se ha eliminado correctamente.",
        subcategoryCreated: "La nueva subcategoría se ha creado correctamente.",
        nameAndTitleRequired:
          "Introduce el nombre de la pestaña y el título de la categoría en al menos un idioma.",
        deleteNotEmpty:
          "No se puede eliminar esta categoría porque todavía tiene platos asociados.",
      },
      page: {
        pageTitle: "Menú | Administración",
        title: "Gestión del menú",
        subtitle: "Categorías, traducciones, platos y precios.",
        summaryAria: "Resumen del menú",

        categorySingular: "categoría",
        categoryPlural: "categorías",
        dishSingular: "plato",
        dishPlural: "platos",

        addCategory: "Añadir categoría",
        closeNewCategory: "Cerrar nueva categoría",

        newItemCreated: "El nuevo plato se ha creado correctamente.",
        categoryUpdated: "La categoría {name} se ha actualizado correctamente.",
        itemUpdated: "El plato {name} se ha actualizado correctamente.",
        itemDeleted: "El plato {name} se ha eliminado correctamente.",
        categoryDeleted: "La categoría {name} se ha eliminado correctamente.",

        categoryCreated: "La nueva categoría se ha creado correctamente.",
        categoryCreatedAddSubcategory:
          "La categoría se ha creado. Añade ahora la subcategoría.",

        itemOrderFailed: "No se pudo cambiar el orden del plato.",
        categoryOrderFailed: "No se pudo cambiar el orden de la categoría.",
        noCategories: "El menú todavía no tiene categorías.",
        noItems: "Esta categoría todavía no tiene platos.",

        changeCategoryOrder: "Cambiar el orden de {name}",
        moveCategoryUp: "Mover {name} hacia arriba",
        moveCategoryDown: "Mover {name} hacia abajo",

        closeCategoryEdit: "Cerrar edición",
        openCategory: "Abrir categoría",
        closeCategory: "Cerrar categoría",

        closeNewItem: "Cerrar nuevo plato",

        changeItemOrder: "Cambiar el orden de {name}",
        moveItemUp: "Mover {name} hacia arriba",
        moveItemDown: "Mover {name} hacia abajo",

        pending: "Pendiente",
        close: "Cerrar",
      },
    },
    apiErrors: {
      categoryNotFound: "No se encontró la categoría.",
      categoryNotEmpty:
        "No se puede eliminar esta categoría porque todavía tiene platos asociados.",

      subcategoryNotFound: "No se encontró la subcategoría.",
      subcategoryCategoryMismatch:
        "La subcategoría seleccionada no pertenece a esta categoría.",

      itemNotFound: "No se encontró el plato.",

      imageTooLarge: "La imagen no puede superar los 5 MB.",
      invalidImageType: "Selecciona una imagen PNG, JPEG o WebP.",
      invalidImageContent:
        "El archivo seleccionado no contiene una imagen válida.",
      imageProcessingFailed: "No se pudo procesar la imagen.",
      imageUploadFailed: "No se pudo cargar la imagen.",

      invalidCategoryData: "Los datos de la categoría no son válidos.",
      invalidSubcategoryData: "Los datos de la subcategoría no son válidos.",
      invalidItemData: "Los datos del plato no son válidos.",

      invalidCategoryOrder: "El orden de la categoría no es válido.",
      invalidSubcategoryOrder: "El orden de la subcategoría no es válido.",
      invalidItemOrder: "El orden del plato no es válido.",

      categoryCreateFailed: "No se pudo crear la categoría.",
      categoryUpdateFailed: "No se pudo actualizar la categoría.",
      categoryDeleteFailed: "No se pudo eliminar la categoría.",
      categoryOrderFailed: "No se pudo cambiar el orden de la categoría.",

      subcategoryCreateFailed: "No se pudo crear la subcategoría.",
      subcategoryUpdateFailed: "No se pudo actualizar la subcategoría.",
      subcategoryDeleteFailed: "No se pudo eliminar la subcategoría.",
      subcategoryOrderFailed: "No se pudo cambiar el orden de la subcategoría.",

      itemCreateFailed: "No se pudo crear el plato.",
      itemUpdateFailed: "No se pudo actualizar el plato.",
      itemDeleteFailed: "No se pudo eliminar el plato.",
      itemOrderFailed: "No se pudo cambiar el orden del plato.",

      userListFailed: "No se pudieron cargar los usuarios.",
      invalidUserData: "Los datos del usuario no son válidos.",
      invalidUserId: "El usuario seleccionado no es válido.",
      userCreateFailed: "No se pudo crear el usuario.",
      userUpdateFailed: "No se pudo actualizar el usuario.",
      userActivateFailed: "No se pudo reactivar el usuario.",
      userDeactivateFailed: "No se pudo desactivar el usuario.",
      cannotDeactivateSelf: "No puedes desactivar tu propia cuenta.",
    },
    settings: {
      pageTitle: "Configuración del negocio | Administración",
      title: "Configuración del negocio",
      subtitle:
        "Gestiona los datos generales y la presencia online del negocio.",
      generalData: "Datos generales",
      name: "Nombre",
      email: "Email",
      phone: "Teléfono",
      addressLine1: "Dirección",
      addressLine2: "Complemento de la dirección",
      postalCode: "Código postal",
      city: "Ciudad",
      countryCode: "País",
      primaryActionUrl: "URL de la acción principal",
      save: "Guardar cambios",
      saving: "Guardando...",
      cancel: "Cancelar",
      saveSuccess: "Los datos del negocio se han actualizado correctamente.",
      saveFailed: "No se pudieron actualizar los datos del negocio.",
      nameRequired: "El nombre del negocio es obligatorio.",
      nameTooLong: "El nombre no puede superar los 160 caracteres.",
      invalidEmail: "Introduce una dirección de email válida.",
      emailTooLong: "El email es demasiado largo.",
      phoneTooLong: "El teléfono no puede superar los 50 caracteres.",
      addressLine1TooLong: "La dirección no puede superar los 200 caracteres.",
      addressLine2TooLong:
        "El complemento de la dirección no puede superar los 200 caracteres.",
      addressLine2Optional: "Complemento de la dirección (opcional)",
      postalCodeTooLong: "El código postal no puede superar los 30 caracteres.",
      cityTooLong: "La ciudad no puede superar los 120 caracteres.",
      invalidCountryCode:
        "El país debe indicarse con un código de 2 letras, por ejemplo ES.",
      invalidUrl: "Introduce una URL válida.",
      urlTooLong: "La URL es demasiado larga.",
      emailRequired: "El email es obligatorio.",
      phoneRequired: "El teléfono es obligatorio.",
      addressRequired: "La dirección es obligatoria.",
      postalCodeRequired: "El código postal es obligatorio.",
      cityRequired: "La ciudad es obligatoria.",
      countryRequired: "El país es obligatorio.",
      taxId: "NIF",
      taxIdRequired: "El NIF es obligatorio.",
      taxIdTooLong: "El NIF no puede superar los 50 caracteres.",

      fiscalData: "Datos fiscales",
      fiscalAddressSameAsBusiness:
        "La dirección fiscal es igual a la dirección del establecimiento",
      fiscalAddressLine1: "Dirección fiscal",
      fiscalAddressLine2: "Complemento de la dirección fiscal (opcional)",
      fiscalPostalCode: "Código postal fiscal",
      fiscalCity: "Ciudad",
      fiscalCountryCode: "País",

      fiscalAddressRequired: "La dirección fiscal es obligatoria.",
      fiscalAddressTooLong:
        "La dirección fiscal no puede superar los 200 caracteres.",
      fiscalAddressLine2TooLong:
        "El complemento de la dirección fiscal no puede superar los 200 caracteres.",
      fiscalPostalCodeRequired: "El código postal fiscal es obligatorio.",
      fiscalPostalCodeTooLong:
        "El código postal fiscal no puede superar los 30 caracteres.",
      fiscalCityRequired: "La ciudad de la dirección fiscal es obligatoria.",
      fiscalCityTooLong:
        "La ciudad de la dirección fiscal no puede superar los 120 caracteres.",
      fiscalCountryRequired: "El país de la dirección fiscal es obligatorio.",
      invalidFiscalCountryCode:
        "El país debe indicarse con un código de 2 letras, por ejemplo ES.",
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
      settingsTitle: "Business settings",
      settingsDescription:
        "Manage the business details, languages, SEO and social media links.",
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
      cancel: "Cancel",
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
    users: {
      pageTitle: "Users | Caldo Verde",
      title: "Users",
      subtitle: "Manage users with access to the administration area.",

      addUser: "Add user",
      newUser: "New user",
      name: "Name",
      email: "Email",
      initialPassword: "Initial password",

      create: "Create user",
      creating: "Creating...",
      edit: "Edit",
      save: "Save",
      saving: "Saving...",
      cancel: "Cancel",

      loadFailed: "Could not load users.",
      createFailed: "Could not create the user.",
      updateFailed: "Could not update the user.",
      statusChangeFailed: "Could not change the user's status.",

      activateTitle: "Reactivate user",
      deactivateTitle: "Deactivate user",
      activateQuestion: "Do you want to reactivate access for {name}?",
      deactivateQuestion: "Do you really want to deactivate access for {name}?",

      activate: "Reactivate",
      deactivate: "Deactivate",
      processing: "Processing...",

      loading: "Loading users...",

      role: "Role",
      status: "Status",
      actions: "Actions",
      administrator: "Administrator",
      active: "Active",
      deactivated: "Deactivated",
    },
    menu: {
      common: {
        name: "Name",
        cancel: "Cancel",
        saving: "Saving...",
        deleting: "Deleting...",
        deletePermanently: "Delete permanently",
        serverError: "Could not communicate with the server.",
      },

      subcategory: {
        add: "Add subcategory",
        edit: "Edit subcategory",
        delete: "Delete subcategory",
        create: "Create subcategory",
        save: "Save subcategory",

        visible: "Subcategory visible on the public website",
        fallbackName: "Subcategory",

        saveFailed: "Could not save the subcategory.",
        deleteFailed: "Could not delete the subcategory.",
        operationFailed: "Could not complete the operation.",

        deleteQuestion: "Delete “{name}”?",
        deleteDescription:
          "The dishes in this subcategory will not be deleted. They will remain without a subcategory.",
        keep: "Keep subcategory",
        nameRequired: "Enter the subcategory name in at least one language.",
        fallbackWithPosition: "Subcategory {position}",
      },
      item: {
        add: "Add dish",
        edit: "Edit",
        delete: "Delete dish",
        create: "Create dish",
        save: "Save changes",
        editDescription: "Change the text, price or visibility.",

        fallbackName: "Dish #{position}",

        description: "Description",

        subcategory: "Subcategory",
        subcategoryDescription: "Select the subcategory for this dish.",
        noSubcategory: "No subcategory",

        image: "Dish image",
        imagePreviewAlt: "Dish preview",
        imageHelp: "Optional image. PNG, JPEG or WebP. Maximum 5 MB.",
        uploadingImage: "Uploading image...",
        removeImage: "Remove dish image",
        removeImageQuestion: "Remove the dish image?",
        removeImageDescription:
          "The image will be removed when you save the dish.",
        keepImage: "Keep image",
        confirmRemoveImage: "Remove image",

        invalidImageType: "Select a PNG, JPEG or WebP image.",
        imageTooLarge: "The image cannot exceed 5 MB.",
        imageUploadFailed: "Could not upload the image.",

        price: "Price / price information",
        pricePlaceholder: "E.g. Half portion: €8 · Portion: €14",
        priceHelp: "You can enter a single price or several options.",

        visible: "Visible",

        saveFailed: "Could not save the dish.",
        deleteFailed: "Could not delete the dish.",

        deleteQuestion: "Delete “{name}”?",
        deleteDescription:
          "This action is permanent. The dish translations will also be deleted.",
        keep: "Keep dish",
        nameRequired: "Enter the dish name in at least one language.",
        hidden: "Hidden",
      },
      category: {
        add: "Add category",
        edit: "Edit category",
        delete: "Delete category",
        create: "Create category",
        save: "Save category",

        tabName: "Tab name",
        title: "Category title",
        highlightText: "Highlighted text (optional)",

        subcategories: "Subcategories",
        subcategoriesDescription:
          "Organize the dishes in this category into sections.",
        subcategoriesOptional:
          "Subcategories are optional. You can add them now or later.",
        noSubcategories: "This category does not have any subcategories yet.",

        visible: "Visible",
        hidden: "Hidden",
        editSubcategory: "Edit",

        changeSubcategoryOrder: "Change the order of {name}",
        moveSubcategoryUp: "Move {name} up",
        moveSubcategoryDown: "Move {name} down",

        image: "Category image",
        imagePreviewAlt: "Category preview",
        imageHelp: "Optional image. PNG, JPEG or WebP. Maximum 5 MB.",
        uploadingImage: "Uploading image...",
        removeImage: "Remove category image",
        removeImageQuestion: "Remove the category image?",
        removeImageDescription:
          "The image will be removed when you save the category.",
        keepImage: "Keep image",
        confirmRemoveImage: "Remove image",

        invalidImageType: "Select a PNG, JPEG or WebP image.",
        imageTooLarge: "The image cannot exceed 5 MB.",
        imageUploadFailed: "Could not upload the image.",
        invalidImagePath: "The image must be in /assets/images/ or /uploads/.",

        visibleOnSite: "Category visible on the public website",

        saveFailed: "Could not save the category.",
        deleteFailed: "Could not delete the category.",
        orderFailed: "Could not change the subcategory order.",

        deleteQuestion: "Delete “{name}”?",
        deleteDescription:
          "This action is permanent and will only be allowed if the category is empty.",
        keep: "Keep category",

        subcategoryOrderUpdated: "The subcategory order was updated.",
        subcategoryUpdated: "The subcategory was updated successfully.",
        subcategoryDeleted: "The subcategory was deleted successfully.",
        subcategoryCreated: "The new subcategory was created successfully.",
        nameAndTitleRequired:
          "Enter the tab name and category title in at least one language.",
        deleteNotEmpty:
          "This category cannot be deleted because it still has dishes associated with it.",
      },
      page: {
        pageTitle: "Menu | Administration",
        title: "Menu management",
        subtitle: "Categories, translations, dishes and prices.",
        summaryAria: "Menu summary",

        categorySingular: "category",
        categoryPlural: "categories",
        dishSingular: "dish",
        dishPlural: "dishes",

        addCategory: "Add category",
        closeNewCategory: "Close new category",

        newItemCreated: "The new dish was created successfully.",
        categoryUpdated: "The category {name} was updated successfully.",
        itemUpdated: "The dish {name} was updated successfully.",
        itemDeleted: "The dish {name} was deleted successfully.",
        categoryDeleted: "The category {name} was deleted successfully.",

        categoryCreated: "The new category was created successfully.",
        categoryCreatedAddSubcategory:
          "The category was created. Add the subcategory now.",

        itemOrderFailed: "Could not change the dish order.",
        categoryOrderFailed: "Could not change the category order.",

        noCategories: "The menu does not have any categories yet.",
        noItems: "This category does not have any dishes yet.",

        changeCategoryOrder: "Change the order of {name}",
        moveCategoryUp: "Move {name} up",
        moveCategoryDown: "Move {name} down",

        closeCategoryEdit: "Close editing",
        openCategory: "Open category",
        closeCategory: "Close category",

        closeNewItem: "Close new dish",

        changeItemOrder: "Change the order of {name}",
        moveItemUp: "Move {name} up",
        moveItemDown: "Move {name} down",

        pending: "Pending",
        close: "Close",
      },
    },
    apiErrors: {
      categoryNotFound: "The category was not found.",
      categoryNotEmpty:
        "This category cannot be deleted because it still has dishes associated with it.",

      subcategoryNotFound: "The subcategory was not found.",
      subcategoryCategoryMismatch:
        "The selected subcategory does not belong to this category.",

      itemNotFound: "The dish was not found.",

      imageTooLarge: "The image cannot exceed 5 MB.",
      invalidImageType: "Select a PNG, JPEG or WebP image.",
      invalidImageContent: "The selected file does not contain a valid image.",
      imageProcessingFailed: "The image could not be processed.",
      imageUploadFailed: "The image could not be uploaded.",

      invalidCategoryData: "The category data is invalid.",
      invalidSubcategoryData: "The subcategory data is invalid.",
      invalidItemData: "The dish data is invalid.",

      invalidCategoryOrder: "The category order is invalid.",
      invalidSubcategoryOrder: "The subcategory order is invalid.",
      invalidItemOrder: "The dish order is invalid.",

      categoryCreateFailed: "The category could not be created.",
      categoryUpdateFailed: "The category could not be updated.",
      categoryDeleteFailed: "The category could not be deleted.",
      categoryOrderFailed: "The category order could not be changed.",

      subcategoryCreateFailed: "The subcategory could not be created.",
      subcategoryUpdateFailed: "The subcategory could not be updated.",
      subcategoryDeleteFailed: "The subcategory could not be deleted.",
      subcategoryOrderFailed: "The subcategory order could not be changed.",

      itemCreateFailed: "The dish could not be created.",
      itemUpdateFailed: "The dish could not be updated.",
      itemDeleteFailed: "The dish could not be deleted.",
      itemOrderFailed: "The dish order could not be changed.",

      userListFailed: "The users could not be loaded.",
      invalidUserData: "The user data is invalid.",
      invalidUserId: "The selected user is invalid.",
      userCreateFailed: "The user could not be created.",
      userUpdateFailed: "The user could not be updated.",
      userActivateFailed: "The user could not be reactivated.",
      userDeactivateFailed: "The user could not be deactivated.",
      cannotDeactivateSelf: "You cannot deactivate your own account.",
    },
    settings: {
      pageTitle: "Business settings | Administration",
      title: "Business settings",
      subtitle: "Manage the general business details and online presence.",
      generalData: "General details",
      name: "Name",
      email: "Email",
      phone: "Phone",
      addressLine1: "Address",
      addressLine2: "Address line 2",
      postalCode: "Postal code",
      city: "City",
      countryCode: "Country",
      primaryActionUrl: "Primary action URL",
      save: "Save changes",
      saving: "Saving...",
      cancel: "Cancel",
      saveSuccess: "The business details were updated successfully.",
      saveFailed: "The business details could not be updated.",
      nameRequired: "The business name is required.",
      nameTooLong: "The name cannot exceed 160 characters.",
      invalidEmail: "Enter a valid email address.",
      emailTooLong: "The email address is too long.",
      phoneTooLong: "The phone number cannot exceed 50 characters.",
      addressLine1TooLong: "The address cannot exceed 200 characters.",
      addressLine2TooLong: "Address line 2 cannot exceed 200 characters.",
      addressLine2Optional: "Address line 2 (optional)",
      postalCodeTooLong: "The postal code cannot exceed 30 characters.",
      cityTooLong: "The city cannot exceed 120 characters.",
      invalidCountryCode:
        "The country must use a 2-letter code, for example ES.",
      invalidUrl: "Enter a valid URL.",
      urlTooLong: "The URL is too long.",
      emailRequired: "Email is required.",
      phoneRequired: "Phone is required.",
      addressRequired: "Address is required.",
      postalCodeRequired: "Postal code is required.",
      cityRequired: "City is required.",
      countryRequired: "Country is required.",
      taxId: "Tax ID",
      taxIdRequired: "The tax ID is required.",
      taxIdTooLong: "The tax ID cannot exceed 50 characters.",

      fiscalData: "Tax details",
      fiscalAddressSameAsBusiness:
        "The tax address is the same as the business address",
      fiscalAddressLine1: "Tax address",
      fiscalAddressLine2: "Tax address line 2 (optional)",
      fiscalPostalCode: "Tax postal code",
      fiscalCity: "City",
      fiscalCountryCode: "Country",

      fiscalAddressRequired: "The tax address is required.",
      fiscalAddressTooLong: "The tax address cannot exceed 200 characters.",
      fiscalAddressLine2TooLong:
        "Tax address line 2 cannot exceed 200 characters.",
      fiscalPostalCodeRequired: "The tax postal code is required.",
      fiscalPostalCodeTooLong:
        "The tax postal code cannot exceed 30 characters.",
      fiscalCityRequired: "The tax address city is required.",
      fiscalCityTooLong: "The tax address city cannot exceed 120 characters.",
      fiscalCountryRequired: "The tax address country is required.",
      invalidFiscalCountryCode:
        "The country must use a 2-letter code, for example ES.",
    },
  },
};
