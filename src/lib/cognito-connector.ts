import { GeneralRequestOptions, SignUpOptions } from '../types';
import {
  ConfirmSignUpRequestBody,
  SignUpRequestBody,
  SignUpResponseBody,
  UserPoolRequestBody,
} from '../types/user-pool';
import { SupportedUserPoolAction } from './cognito-actions';
import { InvalidPasswordException, UserPoolExceptionHandler } from './error';
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

  async signUp(params: SignUpOptions) {
    const requestBody: SignUpRequestBody = {
      ClientId: this.clientId,
      Password: params.password,
      Username: params.username,
    };

    // Build user attributes array
    if (params.attributes && !isEmptyObject(params.attributes)) {
      requestBody.UserAttributes = [];
      for (const key of Object.keys(params.attributes)) {
        requestBody.UserAttributes.push({
          Name: key,
          Value: params.attributes[key],
        });
      }
    }

    // Build Validation Data Array
    if (params.validationData && !isEmptyObject(params.validationData)) {
      requestBody.ValidationData = [];
      for (const key of Object.keys(params.validationData)) {
        requestBody.ValidationData.push({
          Name: key,
          Value: params.validationData[key],
        });
      }
    }

    return this.request<SignUpResponseBody>('SignUp', requestBody);
  }

  async confirmSignUp(
    username: string,
    code: string,
    options?: GeneralRequestOptions,
  ) {
    let requestBody: ConfirmSignUpRequestBody = {
      ClientId: this.clientId,
      Username: username,
      ConfirmationCode: code,
    };
    if (options) {
      requestBody = { ...requestBody, ...options };
    }
    return this.request<never>('ConfirmSignUp', requestBody);
  }

  private async request<T = any>(
    action: SupportedUserPoolAction,
    body: UserPoolRequestBody,
    appendMetadata = true,
  ): Promise<T> {
    const headers = {
      ...DEFAULT_REQUEST_HEADERS,
      'x-amz-target': `AWSCognitoIdentityProviderService.${action}`,
    };

    if (appendMetadata) {
      body.ClientMetadata = this.clientMetadata;
    }

    const res = await fetch(this.host, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    let resBody = null;

    // res.headers.get('content-type')
    try {
      resBody = await res.json();
    } catch (e) {
      resBody = {};
    }

    if (!res.ok) {
      throw UserPoolExceptionHandler.handle(resBody);
    }

    return resBody;
  }
}
