const ADMIN_API_ERROR_KEYS = {
  CATEGORY_NOT_FOUND: "apiErrors.categoryNotFound",
  CATEGORY_NOT_EMPTY: "apiErrors.categoryNotEmpty",

  SUBCATEGORY_NOT_FOUND: "apiErrors.subcategoryNotFound",
  SUBCATEGORY_CATEGORY_MISMATCH: "apiErrors.subcategoryCategoryMismatch",

  ITEM_NOT_FOUND: "apiErrors.itemNotFound",

  IMAGE_TOO_LARGE: "apiErrors.imageTooLarge",
  INVALID_IMAGE_TYPE: "apiErrors.invalidImageType",
  INVALID_IMAGE_CONTENT: "apiErrors.invalidImageContent",
  IMAGE_PROCESSING_FAILED: "apiErrors.imageProcessingFailed",
  IMAGE_UPLOAD_FAILED: "apiErrors.imageUploadFailed",

  INVALID_CATEGORY_DATA: "apiErrors.invalidCategoryData",
  INVALID_SUBCATEGORY_DATA: "apiErrors.invalidSubcategoryData",
  INVALID_ITEM_DATA: "apiErrors.invalidItemData",

  INVALID_CATEGORY_ORDER: "apiErrors.invalidCategoryOrder",
  INVALID_SUBCATEGORY_ORDER: "apiErrors.invalidSubcategoryOrder",
  INVALID_ITEM_ORDER: "apiErrors.invalidItemOrder",

  CATEGORY_CREATE_FAILED: "apiErrors.categoryCreateFailed",
  CATEGORY_UPDATE_FAILED: "apiErrors.categoryUpdateFailed",
  CATEGORY_DELETE_FAILED: "apiErrors.categoryDeleteFailed",
  CATEGORY_ORDER_FAILED: "apiErrors.categoryOrderFailed",

  SUBCATEGORY_CREATE_FAILED: "apiErrors.subcategoryCreateFailed",
  SUBCATEGORY_UPDATE_FAILED: "apiErrors.subcategoryUpdateFailed",
  SUBCATEGORY_DELETE_FAILED: "apiErrors.subcategoryDeleteFailed",
  SUBCATEGORY_ORDER_FAILED: "apiErrors.subcategoryOrderFailed",

  ITEM_CREATE_FAILED: "apiErrors.itemCreateFailed",
  ITEM_UPDATE_FAILED: "apiErrors.itemUpdateFailed",
  ITEM_DELETE_FAILED: "apiErrors.itemDeleteFailed",
  ITEM_ORDER_FAILED: "apiErrors.itemOrderFailed",

  USER_LIST_FAILED: "apiErrors.userListFailed",
  INVALID_USER_DATA: "apiErrors.invalidUserData",
  INVALID_USER_ID: "apiErrors.invalidUserId",
  USER_CREATE_FAILED: "apiErrors.userCreateFailed",
  USER_UPDATE_FAILED: "apiErrors.userUpdateFailed",
  USER_ACTIVATE_FAILED: "apiErrors.userActivateFailed",
  USER_DEACTIVATE_FAILED: "apiErrors.userDeactivateFailed",
  CANNOT_DEACTIVATE_SELF: "apiErrors.cannotDeactivateSelf",
};

export function getAdminApiErrorKey(code, fallbackKey) {
  return ADMIN_API_ERROR_KEYS[code] ?? fallbackKey;
}
