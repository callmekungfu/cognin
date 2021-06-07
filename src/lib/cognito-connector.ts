import {
  AuthChallenge,
  AuthFlows,
  EmptyObject,
  GeneralRequestOptions,
  SignUpOptions,
} from '../types';
import {
  CodeDeliveryDetails,
  ConfirmResetPasswordRequestBody,
  ConfirmSignUpRequestBody,
  GetUserRequestBody,
  InitiateAuthRequestBody,
  InitiateAuthResponseBody,
  ResetPasswordRequestBody,
  RespondToAuthRequestBody,
  SignUpRequestBody,
  SignUpResponseBody,
  GetUserResponse,
  AssociateSoftwareTokenResponseBody,
  AssociateSoftwareTokenRequestBody,
  VerifySoftwareTokenRequestBody,
  VerifySoftwareTokenResponseBody,
} from '../types/user-pool';
import { SupportedUserPoolAction } from './cognito-actions';
import { UserPoolExceptionHandler } from './error';
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
  userPoolId: string;

  constructor(config: UserPoolConnection) {
    this.host = `https://cognito-idp.${config.region}.amazonaws.com`;
    this.userPoolId = config.userPoolId;
    this.clientId = config.clientId;
    this.clientMetadata = config.clientMetadata;
  }

  getUserPoolIdentifier() {
    return this.userPoolId.split('_')[1];
  }

  /**
   * Perform a sign up operation with Cognito's API.
   *
   * @param params Sign up parameter options
   * @returns The response body of the sign up operation
   */
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
    return this.request<EmptyObject>('ConfirmSignUp', requestBody);
  }

  async requestPasswordReset(
    username: string,
    options?: GeneralRequestOptions,
  ) {
    let requestBody: ResetPasswordRequestBody = {
      ClientId: this.clientId,
      Username: username,
    };
    if (options) {
      requestBody = { ...requestBody, ...options };
    }
    return this.request<CodeDeliveryDetails>('ForgotPassword', requestBody);
  }

  async confirmPasswordReset(
    username: string,
    password: string,
    code: string,
    options?: GeneralRequestOptions,
  ) {
    let requestBody: ConfirmResetPasswordRequestBody = {
      ClientId: this.clientId,
      Username: username,
      Password: password,
      ConfirmationCode: code,
    };
    if (options) {
      requestBody = { ...requestBody, ...options };
    }
    return this.request<EmptyObject>('ConfirmForgotPassword', requestBody);
  }

  /**
   * TODO
   * @param authParams
   * @param authType
   * @param options
   * @returns
   */
  async initiateAuth(
    authParams: Record<string, string>,
    authType: AuthFlows,
    options?: GeneralRequestOptions,
  ) {
    let requestBody: InitiateAuthRequestBody = {
      ClientId: this.clientId,
      AuthFlow: authType,
      AuthParameters: authParams,
    };
    if (options) {
      requestBody = { ...requestBody, ...options };
    }
    return this.request<InitiateAuthResponseBody>('InitiateAuth', requestBody);
  }

  /**
   * TODO
   *
   * @param challenge
   * @param challengeParams
   * @param session
   * @returns
   */
  async respondToAuthChallenge(
    challenge: AuthChallenge,
    challengeParams: Record<string, string>,
    session?: string,
  ) {
    const requestBody: RespondToAuthRequestBody = {
      ClientId: this.clientId,
      ChallengeName: challenge,
      ChallengeResponses: challengeParams,
    };

    if (session) {
      requestBody.Session = session;
    }

    return this.request<InitiateAuthResponseBody>(
      'RespondToAuthChallenge',
      requestBody,
    );
  }

  /**
   * TODO
   * @param accessToken
   * @returns
   */
  async getUser(accessToken: string) {
    const requestBody: GetUserRequestBody = {
      AccessToken: accessToken,
    };

    return this.request<GetUserResponse>('GetUser', requestBody);
  }

  /**
   * TODO
   * @param accessToken The access token to use
   * @returns
   */
  async associateSoftwareToken(accessToken: string) {
    const requestBody: AssociateSoftwareTokenRequestBody = {
      AccessToken: accessToken,
    };

    return this.request<AssociateSoftwareTokenResponseBody>(
      'AssociateSoftwareToken',
      requestBody,
    );
  }

  /**
   * Request to verify a user's software token by taking a code
   *
   * @param accessToken The user access token
   * @param code The user code from the OTP client
   * @param friendlyDeviceName A friendly device name to record
   * @returns the response body from the requested action
   */
  async verifySoftwareToken(
    accessToken: string,
    code: string,
    friendlyDeviceName?: string,
  ) {
    const requestBody: VerifySoftwareTokenRequestBody = {
      AccessToken: accessToken,
      UserCode: code,
    };
    if (friendlyDeviceName) {
      requestBody.FriendlyDeviceName = friendlyDeviceName;
    }
    return this.request<VerifySoftwareTokenResponseBody>(
      'VerifySoftwareToken',
      requestBody,
    );
  }

  async globalSignOut(accessToken: string) {
    return this.request<EmptyObject>('GlobalSignOut', {
      AccessToken: accessToken,
    });
  }

  async verifyAttribute() {}

  /**
   * A generic function for sending requests to Cognito
   *
   * @param action The action to perform
   * @param body The request body
   * @param appendMetadata should append ClientMetadata to the request body
   * @returns The response body in json format
   */
  private async request<T = any>(
    action: SupportedUserPoolAction,
    body: any,
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
