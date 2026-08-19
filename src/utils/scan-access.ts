import { ConfigByCodePin } from '@/api/events-api';

type ConfigItems = ConfigByCodePin['items'];

export function getValidEventIds(items: ConfigItems): string[] {
  return items.map((item) => item.eventCode);
}

export function getValidSections(items: ConfigItems): string[] {
  return [...new Set(items.flatMap((item) => item.sections.map((section) => section.code)))];
}
