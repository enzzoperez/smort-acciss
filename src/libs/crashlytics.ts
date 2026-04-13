import crashlytics from '@react-native-firebase/crashlytics';

export const logError = (error: unknown) => {
  crashlytics().recordError(error as Error);
};

export const setAttributes = (attributes: { [key: string]: string }) => {
  crashlytics().setAttributes(attributes);
};
