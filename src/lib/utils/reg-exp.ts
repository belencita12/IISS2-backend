/**
 * Time format RegExp HH:MM 00:00 - 23:59
 */
export const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * RUC format RegExp 123456-1 / 123456 [6-9 digits]-[0-9]
 */
export const rucFormat = /^\d{6,9}(-\d)?$/;

/**
 * Only numbers RegExp [0-9]
 */
export const onlyNumbers = /^[\d-]+$/;

/**
 * Slug format for service-type. Ex: meet-30-min
 */
export const serviceTypeSlugFormat = /^[a-z0-9ñ]+(?:-[a-z0-9ñ]+)*$/;

/**
 * Is the format of the invoice number 123-123-1234567
 */
export const invoiceNumber = /^\d{3}-\d{3}-\d{7}$/;
