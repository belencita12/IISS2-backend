/**
 * Time format RegExp HH:MM 00:00 - 23:59
 */
export const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * RUC format RegExp 12345678-1 [8-9 digits]-[1-9]
 */
export const rucFormat = /^\d{8,9}-[1-9]$/;

/**
 * Only numbers RegExp [0-9]
 */
export const onlyNumbers = /^[\d-]+$/;
