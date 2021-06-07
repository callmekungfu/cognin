import { Credentials } from '../types';
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

  /**
   * Authenticate the user with results from Cognito.
   *
   * @param res Authentication result from cognito
   * @returns the user for chaining purposes
   */
  authenticate(res: AuthenticationResult) {
    this.session = new CognitoSession(res, this.prefix);
    return this;
  }

  /**
   * Load the user session from cache. This is ran by default when the user is created
   * if the cached tokens are not set then the session is not loaded.
   */
  loadSessionFromCache() {
    this.session = CognitoSession.fromCache(this.prefix);
  }

  /**
   * Check if the user's session tokens are still valid.
   *
   * Tokens get refreshed if they are not valid but the
   * refresh token is present.
   *
   * Return false if refresh fails as well.
   * @returns True if the user session is still valid
   */
  async isUserSessionValid() {
    try {
      await this.checkUserSession();
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * Return the user's authenticated session.
   *
   * @returns The session if it is still valid.
   */
  async getSession() {
    if (!(await this.isUserSessionValid())) {
      return null;
    }
    return this.session;
  }

  /**
   * Return the user's authenticated identity tokens.
   *
   * @returns the user's id token and access token if it's still valid
   */
  async getCredentials(): Promise<Credentials | null> {
    if (!(await this.isUserSessionValid())) {
      return null;
    }
    return {
      accessId: this.session?.accessToken?.getJWTToken(),
      identityId: this.session?.idToken?.getJWTToken(),
    };
  }

  /**
   * Getter for the user's username.
   *
   * @returns The user's username
   */
  getUsername() {
    return this.username;
  }

  /**
   * Sign out the user. If true is passed in, user will be signed
   * out of all devices.
   *
   * @param global sign out the user globally if true
   */
  async signOut(global = false) {
    if (global) {
      await this.userPool.globalSignOut(this.accessToken);
    }
    this.session?.clearSessionCache();
    this.session = undefined;
  }

  /**
   * Get the user's attributes in an array.
   *
   * @returns The array of user attributes
   */
  async getUserAttributes() {
    await this.checkUserSession();
    if (!this.userAttributes) {
      const res = await this.userPool.getUser(this.accessToken);
      this.user = res;
      this.userAttributes = res.UserAttributes;
    }
    return this.userAttributes;
  }

  /**
   * Same as `getUserAttributes` but the result is mapped in
   * an object.
   *
   * @returns The user's user attributes in an object format
   */
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

  /**
   * Get the user's MFA selection.
   *
   * @returns the user's preferred mfa setting in string
   */
  async getPreferredMFA() {
    await this.checkUserSession();
    if (!this.user) {
      await this.getUserAttributes();
    }
    return this.user?.PreferredMfaSetting ?? null;
  }

  /**
   * Setup TOTP challenge for the user.
   *
   * @returns The result from `AssociateSoftwareToken` request
   */
  async setupTOTP() {
    await this.checkUserSession();
    return this.userPool.associateSoftwareToken(this.accessToken);
  }

  /**
   * Verify TOTP device.
   *
   * @param code The TOTP code from the suer
   * @param friendlyDeviceName an optional name for the device
   * @returns the result of `VerifySoftwareToken` action
   */
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
