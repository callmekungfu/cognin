export interface oAuthConfiguration {
  domain: string;
  scope: string[];
  redirectSignIn: string;
  redirectSignOut: string;
  responseType: 'code' | 'token';
}

export interface CogninConfiguration {
  region: string;
  clientId: string;
  userPoolId: string;
  oauth?: oAuthConfiguration;
  clientMetadata?: Record<string, any>;
  authenticationFlow?:
    | 'USER_SRP_AUTH'
    | 'USER_PASSWORD_AUTH'
    | 'CUSTOM_AUTH'
    | 'ADMIN_USER_PASSWORD_AUTH';
}

export interface SignUpOptions {
  username: string;
  password: string;
  attributes?: Record<string, string>;
  validationData?: Record<string, string>;
}

export interface GeneralRequestOptions {
  AnalyticsMetadata?: AnalyticsMetadata;
  SecretHash?: string;
  UserContextData?: UserContextData;
}

export type EmptyObject = {};

export interface AnalyticsMetadata {
  AnalyticsEndpointId: string;
}

export interface UserContextData {
  EncodedData: string;
}

export type AuthFlows =
  | 'REFRESH_TOKEN_AUTH'
  | 'USER_SRP_AUTH'
  | 'USER_PASSWORD_AUTH'
  | 'CUSTOM_AUTH'
  | 'ADMIN_USER_PASSWORD_AUTH';

export type AuthChallenge =
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
