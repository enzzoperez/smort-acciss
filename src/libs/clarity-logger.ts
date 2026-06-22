import { setCustomTag } from '@microsoft/react-native-clarity';

export const clarityLogError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  void setCustomTag('error', message);
};

export const claritySetAttributes = (attributes: { [key: string]: string }) => {
  Object.entries(attributes).forEach(([key, value]) => {
    void setCustomTag(key, value);
  });
};

export const clarityLogMessage = (message: string) => {
  void setCustomTag('log', message);
};
