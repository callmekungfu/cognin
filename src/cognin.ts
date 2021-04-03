import { CogninConfiguration, SignUpOptions } from './types';

const defaultConfigOptions: Partial<CogninConfiguration> = {
  authenticationFlow: 'USER_SRP_AUTH',
};

export class Cognin {
  private config: CogninConfiguration | undefined;

  configure(config: CogninConfiguration) {
    this.config = config;
  }

  public signUp(opts: SignUpOptions) {}
}
