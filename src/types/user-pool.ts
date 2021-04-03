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
