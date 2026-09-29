import { differenceInMinutes, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDateAndHour = (date: Date) => {
  return format(date, "dd/MM/yyyy '-' HH:mm:ss");
};

export const formatDateWithOffset = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
};

export const formatDateGMTMinus3 = (date: Date | string): string => {
  const d = new Date(date);
  const gmt3 = new Date(d.getTime() - 3 * 60 * 60 * 1000);

  const year = gmt3.getUTCFullYear();
  const month = String(gmt3.getUTCMonth() + 1).padStart(2, '0');
  const day = String(gmt3.getUTCDate()).padStart(2, '0');
  const hours = String(gmt3.getUTCHours()).padStart(2, '0');
  const minutes = String(gmt3.getUTCMinutes()).padStart(2, '0');
  const seconds = String(gmt3.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const formatSyncTime = (date: Date | string): string => {
  return format(new Date(date), 'HH:mm') + ' hs';
};

export const isOlderThan30Minutes = (date: Date | string): boolean => {
  return differenceInMinutes(new Date(), new Date(date)) >= 30;
};

export const formatEventShortDate = (date: Date | string): string => {
  return format(new Date(date), "d MMM '·' HH:mm", { locale: es }).toLowerCase();
};
