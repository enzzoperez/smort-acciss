import crashlytics from '@react-native-firebase/crashlytics';

export const logError = (error: unknown) => {
  const err = error instanceof Error ? error : new Error(String(error));
  crashlytics().recordError(err);
};

export const setAttributes = (attributes: { [key: string]: string }) => {
  crashlytics().setAttributes(attributes);
};

export const logMessage = (message: string) => {
  crashlytics().log(message);
};
