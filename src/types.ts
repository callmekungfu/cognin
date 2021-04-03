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
    | 'USER_SRP_AUTH'
    | 'CUSTOM_AUTH'
    | 'ADMIN_USER_PASSWORD_AUTH';
}

export interface SignUpOptions {
  username: string;
  password: string;
  attributes?: Record<string, string>;
  validationData?: Record<string, string>;
}
