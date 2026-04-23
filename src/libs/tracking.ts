import { sendCustomEvent } from '@microsoft/react-native-clarity';

export const trackEvent = (event: string) => {
  void sendCustomEvent(event);
};
