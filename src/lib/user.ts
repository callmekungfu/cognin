import {
  AuthenticationResult,
  GetUserResponse,
  UserAttribute,
} from '../types/user-pool';
import { UserPool } from './cognito-connector';
import { CognitoSession } from './session';

export class CognitoUser {
  private prefix: string;
  private session?: CognitoSession;
  private userAttributes?: UserAttribute[];
  private user?: GetUserResponse;

  constructor(private username: string, private userPool: UserPool) {
    this.prefix = `${userPool.getUserPoolIdentifier()}.${username}`;
    this.loadSessionFromCache();
  }

  private get accessToken() {
    return this.session?.accessToken?.getJWTToken() ?? '';
  }

  authenticate(res: AuthenticationResult) {
    this.session = new CognitoSession(res, this.prefix);
    return this;
  }

  loadSessionFromCache() {
    this.session = CognitoSession.fromCache(this.prefix);
  }

  getSession() {
    if (!this.session?.isValid()) {
      return null;
    }
    return this.session;
  }

  getUsername() {
    return this.username;
  }

  async getUserAttributes() {
    await this.checkUserSession();
    if (!this.userAttributes) {
      const res = await this.userPool.getUser(this.accessToken);
      this.user = res;
      this.userAttributes = res.UserAttributes;
    }
    return this.userAttributes;
  }

  async getUserAttributeMap() {
    await this.checkUserSession();
    let attributes: UserAttribute[] = [];
    if (!this.userAttributes) {
      attributes = await this.getUserAttributes();
    } else {
      attributes = this.userAttributes;
    }
    const res: Record<string, any> = {};
    for (const entry of attributes) {
      res[entry.Name] = entry.Value;
    }
    return res;
  }

  async getPreferredMFA() {
    await this.checkUserSession();
    if (!this.user) {
      await this.getUserAttributes();
    }
    return this.user?.PreferredMfaSetting ?? null;
  }

  async setupTOTP() {
    await this.checkUserSession();
    return this.userPool.associateSoftwareToken(this.accessToken);
  }

  async verifyTOTP(code: string, friendlyDeviceName?: string) {
    await this.checkUserSession();
    return this.userPool.verifySoftwareToken(
      this.accessToken,
      code,
      friendlyDeviceName,
    );
  }

  private async checkUserSession() {
    if (!this.session?.isValid() || !this.session.accessToken) {
      if (this.session?.refreshToken) {
        const res = await this.refreshUserSession(this.session.refreshToken);
        if (res.AuthenticationResult) {
          this.authenticate(res.AuthenticationResult);
          return;
        }
      }
      throw new Error('User is not authenticated.');
    }
  }

  private refreshUserSession(token: string) {
    return this.userPool.initiateAuth(
      {
        REFRESH_TOKEN: token,
      },
      'REFRESH_TOKEN_AUTH',
    );
  }
}
