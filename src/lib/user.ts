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
  }

  authenticate(res: AuthenticationResult) {
    this.session = new CognitoSession(res, this.prefix);
    return this;
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
    this.checkUserSession();
    if (!this.userAttributes) {
      const res = await this.userPool.getUser(
        this.session?.accessToken?.getJWTToken() ?? '',
      );
      this.user = res;
      this.userAttributes = res.UserAttributes;
    }
    return this.userAttributes;
  }

  async getUserAttributeMap() {
    this.checkUserSession();
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
    this.checkUserSession();
    if (!this.user) {
      await this.getUserAttributes();
    }
    return this.user?.PreferredMfaSetting ?? null;
  }

  async setupTOTP() {
    this.checkUserSession();
    return this.userPool.associateSoftwareToken(
      this.session?.accessToken?.getJWTToken() ?? '',
    );
  }

  private checkUserSession() {
    if (!this.session?.isValid() || !this.session.accessToken) {
      throw new Error('User is not authenticated.');
    }
  }
}
