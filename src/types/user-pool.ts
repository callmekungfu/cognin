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

export interface ConfirmSignUpRequestBody extends UserPoolRequestBody {
  AnalyticsMetadata?: AnalyticsMetadata;
  ConfirmationCode: string;
  ForceAliasCreation?: boolean;
  SecretHash?: string;
  UserContextData?: UserContextData;
  Username: string;
}

export interface AnalyticsMetadata {
  AnalyticsEndpointId: string;
}

export interface UserAttribute {
  Name: string;
  Value: string;
}

export interface UserContextData {
  EncodedData: string;
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
