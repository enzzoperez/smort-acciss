import { setCustomTag } from '@microsoft/react-native-clarity';

export const logError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  void setCustomTag('error', message);
};

export const setAttributes = (attributes: { [key: string]: string }) => {
  Object.entries(attributes).forEach(([key, value]) => {
    void setCustomTag(key, value);
  });
};

export const logMessage = (message: string) => {
  void setCustomTag('log', message);
};
