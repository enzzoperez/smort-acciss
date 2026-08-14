import { ECredentialType } from './user';

export interface IErrorApiResponse {
  id: string;
  code: string;
  message: string;
  detail: string;
}

export interface IAccessDataForm {
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IPersonalDataForm {
  name: string;
  surname: string;
  personIdType: string;
  personIdValue: string;
}

export interface IBillingDataForm {
  taxIdValue?: string;
  corporateName?: string;
  email?: string;
  skipFormCheck?: boolean;
  termsAndConditionsAccepted: boolean;
}

export interface IReqLogin {
  accountCredentialType: 'PHONE_NUMBER' | ECredentialType;
  accountCredentialValue: string;
  password: string;
}

export interface IReqLogout {
  accountId: string | null | undefined;
}

export interface LoginUserResponse {
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
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  businessName: string;
  termsAndConditionsAccepted: boolean;
  ruc: string;
}

export type Role = 'REPORTS';

export interface IReqRegister {
  phoneNumber: string;
  email: string;
  password: string;
  name: string;
  surname: string;
  personIdType: string;
  personIdValue: string;
  birthDate?: string | undefined;
  address?: string | undefined;
}

export interface IReqRegisterPerson {
  accountId: string;
  name: string;
  surname: string;
  personIdType: string;
  personIdValue: string;
  birthDate?: string | undefined;
  address?: string | undefined;
}

export interface IReqRegisterPersonBackend {
  name: string;
  surname: string;
  personId: {
    type: string;
    value: string;
  };
  birthDate?: string | undefined;
  address?: string | undefined;
}

export interface IReqMinimalRegister {
  email?: string;
  phoneNumber: string;
  password: string;
}

export interface IReqRegisterTaxInformation {
  accountId: string;
  personIdType: string;
  personIdValue: string;
  businessName: string;
  email: string;
  termsAndConditionsAccepted: boolean;
}

export interface IReqRegisterTaxInformationBackend {
  personId: {
    type: string;
    value: string;
  };
  businessName: string;
  email: string;
  termsAndConditionsAccepted: boolean;
}

export interface IResRegister {
  accountId: string;
}

export interface IReqVerify {
  accountId: string;
  verificationValue: string;
}

export interface IResendOtp {
  accountId: string;
}
