export interface Event {
  code: string;
  date: string;
  expired: boolean;
  featured: boolean;
  hierarchy: string;
  legacyUri?: string;
  image: EventImage;
  minutesExpiration: number;
  name: string;
  order: number;
  preSaleActivated: boolean;
  soldOut: boolean;
  type: string;
  venue: {
    code: string;
    coordinates: { latitude: number; longitude: number };
    country: string;
    name: string;
    state: string;
    zipCode: string;
    image?: string;
    address?: string;
    imageUrl?: string;
  };
  membership: {
    brand: string;
  };
}

export interface CategoryEvents {
  category: string;
  cards: Event[];
}

export interface EventsResponse {
  categories: CategoryEvents[];
}

export interface EventDetailRequest {
  eventCode: string;
}

export enum EHierarchyEvent {
  SIMPLE = 'SIMPLE',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
}

export interface Section {
  code: string;
  name: string;
  section?: string;
  detail?: string;
  disabled?: boolean;
  numbered?: boolean;
  quantity?: number;
  price?: {
    basePrice?: number;
    serviceFee?: number;
    total: number;
  };
  stockAvailable?: number;
  sections: Section[];
  promotionNxM?: PromotionNxM;
  virtual: boolean;
  link: string;
  ageRestriction?: {
    enabled: boolean;
    min?: number;
    max?: number;
  };
}

export enum QR_MODE {
  DYNAMIC = 'DYNAMIC',
  STATIC = 'STATIC',
}

export enum TicketType {
  UPCOMING = 'UPCOMING',
  PENDING = 'PENDING',
  PAST = 'PAST',
}

export interface EventDetailResponse {
  legacyUri: string;
  hierarchy: EHierarchyEvent;
  code: string;
  codeParent: string;
  name: string;
  enabled: boolean;
  type: string;
  date: string;
  dateTo: string;
  featured: boolean;
  venue: {
    code: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    imageUrl: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  detail: string;
  accessPolicies: string;
  image: EventImage;
  maxSalesQuantity: number;
  layout: {
    code: string;
    name: string;
    seatGrid: string;
    frame: string;
    event: string;
    sections: Section[];
    template: boolean;
    includesFee: boolean;
  };
  events: EventDetailResponse[];
  tags: string[];
  soldOut: boolean;
  nomination: NominationType;
  expired: boolean;
  minutesExpiration: number;
  membership: {
    brand: string;
  };
  qrMode: QR_MODE;
}

export interface EventImage {
  detail: BackOfficeEventImage;
  principal: BackOfficeEventImage;
}

export interface BackOfficeEventImage {
  small?: string;
  medium?: string;
  large?: string;
}

export type EventCategory = string;

export interface Seat {
  code: string;
  status: 'SOLD' | 'FREE' | 'UNKNOWN' | 'RESERVED' | 'NOT-SEAT';
}

export interface Row {
  seats: Seat[];
}
export interface SectionSeatsGrid {
  section: string;
  rows: Row[];
}

export enum NominationType {
  NONE = 'NONE',
  SIMPLE = 'SIMPLE',
  MULTIPLE = 'MULTIPLE',
}

export interface MembershipRequestHeader {
  membership: Membership;
}

export interface Membership {
  brand: string;
  eventId: string;
}

export interface PromotionNxM {
  enable: boolean;
  value: string;
  applyFee: boolean;
}

export interface CancelCartRequest {
  cartId: string;
  membership?: Membership;
}
