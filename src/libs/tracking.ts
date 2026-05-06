import { sendCustomEvent, setCustomTag, setCustomUserId } from '@microsoft/react-native-clarity';

export const trackEvent = (event: string, tags?: Record<string, string>) => {
  if (tags) {
    Object.entries(tags).forEach(([key, value]) => {
      void setCustomTag(key, value);
    });
  }
  void sendCustomEvent(event);
};

export const setTrackingUserId = (userId: string) => {
  void setCustomUserId(userId);
};
