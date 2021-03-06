import { UserPool } from './lib/cognito-connector';
import { Logger } from './lib/logger';
import { SRPClient } from './lib/srp-client';
import { CognitoUser } from './lib/user';
import {
  CogninConfiguration,
  GeneralRequestOptions,
  SignUpOptions,
} from './types';

const defaultConfigOptions: Partial<CogninConfiguration> = {
  authenticationFlow: 'USER_SRP_AUTH',
};

export class Cognin {
  private config!: CogninConfiguration;
  private userPool!: UserPool;
  private user?: CognitoUser;

  constructor(config?: CogninConfiguration) {
    if (config) {
      this.configure(config);
    }
  }

  configure(config: CogninConfiguration) {
    const check = this.assertConfig(config);
    if (check) {
      throw Error(check);
    }
    this.config = { ...defaultConfigOptions, ...config };
    this.userPool = new UserPool({
      clientId: this.config.clientId,
      clientMetadata: this.config.clientMetadata ?? {},
      region: this.config.region,
      userPoolId: this.config.userPoolId,
    });
  }

  public signUp(opts: SignUpOptions) {
    this.validateClient();
    return this.userPool.signUp(opts);
  }

  public signOut(global = false) {
    if (!this.user) {
      Logger.warn('No user is signed in, sign out has been skipped.');
      return;
    }
    return this.user?.signOut(global);
  }

  public confirmSignUp(
    username: string,
    code: string,
    confirmOptions?: GeneralRequestOptions,
  ) {
    this.validateClient();
    return this.userPool.confirmSignUp(username, code, confirmOptions);
  }

  public requestPasswordReset(
    username: string,
    options?: GeneralRequestOptions,
  ) {
    this.validateClient();
    return this.userPool.requestPasswordReset(username, options);
  }

  public confirmPasswordReset(
    username: string,
    password: string,
    code: string,
    options?: GeneralRequestOptions,
  ) {
    this.validateClient();
    return this.userPool.confirmPasswordReset(
      username,
      password,
      code,
      options,
    );
  }

  public async signIn(username: string, password?: string) {
    this.validateClient();
    const preferredFlow = this.config.authenticationFlow ?? 'USER_SRP_AUTH';
    let params: Record<string, string> = {
      USERNAME: username,
    };
    let res;
    if (password) {
      if (preferredFlow === 'USER_SRP_AUTH') {
        res = await new SRPClient().authenticate(
          this.userPool,
          username,
          password,
        );
      } else if (preferredFlow === 'USER_PASSWORD_AUTH') {
        params.PASSWORD = password;
        res = await this.userPool.initiateAuth(params, preferredFlow);
      } else {
        Logger.error('CUSTOM_AUTH is not yet supported.');
      }
    }
    const user = new CognitoUser(username, this.userPool);
    if (res?.AuthenticationResult) {
      user.authenticate(res.AuthenticationResult);
      this.user = user;
    }
    return user;
  }

  public async getPreferredMFA(user: CognitoUser) {
    return user.getPreferredMFA();
  }

  public async getCurrentAuthenticatedUser() {
    if (this.user && (await this.user.isUserSessionValid())) {
      return this.user;
    }
    this.user = undefined;
    return null;
  }

  public async getCurrentUserAttributes() {
    if (this.user && (await this.user.isUserSessionValid())) {
      return this.user.getUserAttributes();
    }
    this.user = undefined;
    return null;
  }

  public async getCurrentUserAttributeMap() {
    if (this.user && (await this.user.isUserSessionValid())) {
      return this.user.getUserAttributeMap();
    }
    this.user = undefined;
    return null;
  }

  private validateClient() {
    if (!this.config) {
      throw Error(
        'Cognin instance is not yet configured, please call Auth.configure first.',
      );
    }

    if (!this.userPool) {
      throw Error(
        'Cognin instance is not configured for working with user pools.',
      );
    }
  }

  private assertConfig(config: CogninConfiguration) {
    if (!config) {
      return 'Config is undefined';
    }

    if (!config.clientId || !config.region) {
      return 'Config missing attributes';
    }

    return null;
  }
}
