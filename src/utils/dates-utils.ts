import { differenceInMinutes, format } from 'date-fns';

export const formatDateWithOffset = (date: Date | string) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ssXXX");
};

export const formatDateWithoutTimezone = (date: Date | string) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
};

export const formatSyncTime = (date: Date | string): string => {
  return format(new Date(date), 'HH:mm') + ' hs';
};

export const isOlderThan30Minutes = (date: Date | string): boolean => {
  return differenceInMinutes(new Date(), new Date(date)) >= 30;
};
