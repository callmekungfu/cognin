import { GeneralRequestOptions } from '../types';

export interface UserPoolRequestBody {
  ClientId: string;
  ClientMetadata?: Record<string, string>;
}

export interface SignUpRequestBody
  extends UserPoolRequestBody,
    GeneralRequestOptions {
  Password: string;
  UserAttributes?: UserAttribute[];
  Username: string;
  ValidationData?: UserAttribute[];
}

export interface ConfirmSignUpRequestBody
  extends UserPoolRequestBody,
    GeneralRequestOptions {
  ConfirmationCode: string;
  ForceAliasCreation?: boolean;
  Username: string;
}

export interface ResetPasswordRequestBody
  extends UserPoolRequestBody,
    GeneralRequestOptions {
  Username: string;
}

export interface ConfirmResetPasswordRequestBody
  extends UserPoolRequestBody,
    GeneralRequestOptions {
  Username: string;
  Password: string;
  ConfirmationCode: string;
}

export interface InitiateAuthRequestBody
  extends UserPoolRequestBody,
    GeneralRequestOptions {
  AuthFlow: string;
  AuthParameters: Record<string, string>;
}

export interface UserAttribute {
  Name: string;
  Value: string;
}

export interface SignUpResponseBody {
  CodeDeliveryDetails: CodeDeliveryDetails;
  UserConfirmed: boolean;
  UserSub: string;
}

export interface InitiateAuthResponseBody {
  AuthenticationResult?: AuthenticationResult;
  ChallengeName?:
    | 'SMS_MFA'
    | 'SOFTWARE_TOKEN_MFA'
    | 'SELECT_MFA_TYPE'
    | 'MFA_SETUP'
    | 'PASSWORD_VERIFIER'
    | 'CUSTOM_CHALLENGE'
    | 'DEVICE_SRP_AUTH'
    | 'DEVICE_PASSWORD_VERIFIER'
    | 'ADMIN_NO_SRP_AUTH'
    | 'NEW_PASSWORD_REQUIRED';
  ChallengeParameters?: Record<string, string>;
  Session?: string;
}

export interface AuthenticationResult {
  AccessToken?: string;
  ExpiresIn?: number;
  IdToken?: string;
  NewDeviceMetadata?: NewDeviceMetadataType;
  RefreshToken?: string;
  TokenType?: string;
}

export interface NewDeviceMetadataType {
  DeviceGroupKey?: string;
  DeviceKey?: string;
}

export interface CodeDeliveryDetails {
  AttributeName: string;
  DeliveryMedium: string;
  Destination: string;
}
