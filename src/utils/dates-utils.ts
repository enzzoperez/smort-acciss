import { format } from 'date-fns';

export const formatDateWithOffset = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ssXXX");
};
