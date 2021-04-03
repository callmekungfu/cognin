import { SignUpOptions } from '../types';
import { SignUpRequestBody, UserPoolRequestBody } from '../types/user-pool';
import { isEmptyObject } from './helpers';

export interface UserPoolConnection {
  userPoolId: string;
  region: string;
  clientId: string;
  clientMetadata: Record<string, string>;
}

const DEFAULT_REQUEST_HEADERS = {
  'Content-Type': 'application/x-amz-json-1.1',
};

export class UserPool {
  host: string;
  clientId: string;
  clientMetadata: Record<string, string>;

  constructor(config: UserPoolConnection) {
    this.host = `https://cognito-idp.${config.region}.amazonaws.com`;
    this.clientId = config.clientId;
    this.clientMetadata = config.clientMetadata;
  }

  signUp(params: SignUpOptions) {
    const requestBody: SignUpRequestBody = {
      ClientId: this.clientId,
      ClientMetadata: this.clientMetadata,
      Password: params.password,
      Username: params.username,
    };

    if (params.attributes && !isEmptyObject(params.attributes)) {
      requestBody.UserAttributes = [];
      for (const key of Object.keys(params.attributes)) {
        requestBody.UserAttributes.push({
          Name: key,
          Value: params.attributes[key],
        });
      }
    }
  }

  private async request(action: string, body: UserPoolRequestBody) {
    const headers = {
      ...DEFAULT_REQUEST_HEADERS,
      'x-amz-target': `AWSCognitoIdentityProviderService.${action}`,
    };

    const res = await fetch(this.host, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
    }
  }
}
