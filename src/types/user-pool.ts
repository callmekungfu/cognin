import {
  AnalyticsMetadata,
  GeneralRequestOptions,
  UserContextData,
} from '../types';

export interface UserPoolRequestBody {
  ClientId: string;
  ClientMetadata?: Record<string, string>;
}

export interface SignUpRequestBody extends UserPoolRequestBody {
  AnalyticsMetadata?: AnalyticsMetadata;
  Password: string;
  SecretHash?: string;
  UserAttributes?: UserAttribute[];
  UserContextData?: UserContextData;
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

export interface UserAttribute {
  Name: string;
  Value: string;
}

export interface SignUpResponseBody {
  CodeDeliveryDetails: CodeDeliveryDetails;
  UserConfirmed: boolean;
  UserSub: string;
}

export interface CodeDeliveryDetails {
  AttributeName: string;
  DeliveryMedium: string;
  Destination: string;
}
