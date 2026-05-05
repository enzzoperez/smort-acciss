import { logError, logMessage, setAttributes } from '@/libs/crashlytics';
import { clarityLogError, clarityLogMessage, claritySetAttributes } from '@/libs/clarity-logger';

export const reportError = (error: unknown) => {
  logError(error);
  clarityLogError(error);
};

export const reportMessage = (message: string) => {
  logMessage(message);
  clarityLogMessage(message);
};

export const reportAttributes = (attributes: { [key: string]: string }) => {
  setAttributes(attributes);
  claritySetAttributes(attributes);
};
