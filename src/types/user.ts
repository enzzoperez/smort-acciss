import { Role } from '../types/auth';

export enum ECredentialType {
  CI = 'CI',
  TAX_ID = 'TAX_ID',
  DNI = 'DNI',
  PASSPORT = 'PASSPORT',
}

export interface UserState {
  accountId: string;
  userId: string;
  phoneNumber: string;
  email: string;
  name: string;
  surname: string;
  document: {
    type: string;
    number: string;
  };
  birthDate: string;
  address: string;
  roles: Role[];
  businessName: string;
  termsAndConditionsAccepted: boolean;
  ruc: string;
}

export interface UpdateUserView {
  name?: string;
  surname?: string;
  email?: string;
  birthDate?: string;
  phoneNumber?: string;
  personIdType?: string;
  personIdValue?: string;
}

export interface UpdateTaxInformationView {
  ruc?: string;
  businessName?: string;
  address?: string;
}

export interface UpdateUserRequest {
  accountId: string;
  personInformation?: Partial<PersonInformation>;
  taxInformation?: Partial<TaxInformationRequest>;
}

interface TaxInformationRequest {
  personId: {
    type: string;
    value: string;
  };
  businessName: string;
  termsAndConditionsAccepted?: boolean;
}

interface PersonInformation {
  name: string;
  surname: string;
  personId: {
    type: string;
    value: string;
  };
  birthDate: string;
  address: string;
  email: string;
}

export interface UpdateUserResponse {
  accountId: string;
}

export interface RUCResponse {
  fullName: string;
  documentType: string;
  documentNumber: string;
}

export interface ValidateInfoPersonRequest {
  documentNumber: string;
  documentType: string;
  eventCode: string;
  layoutSection: string;
}

export interface ValidateInfoPersonResponse {
  personInfo: {
    documentNumber: string;
    firstName: string;
    lastName: string;
  };
}
