import { UserPool } from './lib/cognito-connector';
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
    this.config = config;
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
