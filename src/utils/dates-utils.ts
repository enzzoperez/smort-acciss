import { format } from 'date-fns';

export const formatDateAndHour = (date: Date) => {
  return format(date, "dd/MM/yyyy '-' HH:mm:ss");
};

export const formatDateWithOffset = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ssXXX");
};
