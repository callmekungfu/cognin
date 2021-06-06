import { AuthenticationResult } from '../types/user-pool';
import { JWTToken } from './helpers';

export class CognitoSession {
  accessToken?: JWTToken;
  idToken?: JWTToken;
  refreshToken?: string;
  clockDrift: number;

  constructor(
    res: AuthenticationResult,
    private prefix: string,
    cacheTokens = true,
    clockDrift?: number,
  ) {
    this.setSessionTokens(res);
    if (cacheTokens) {
      this.cacheSessionTokens();
    }
    this.clockDrift = clockDrift ?? this.calculateClockDrift();
  }

  static fromCache(prefix: string) {
    const getKey = (token: string) => prefix + token;
    const RefreshToken = localStorage.getItem(getKey('refreshToken'));
    const AccessToken = localStorage.getItem(getKey('accessToken'));
    const IdToken = localStorage.getItem(getKey('idToken'));
    if (!RefreshToken || !AccessToken || !IdToken) {
      return undefined;
    }
    return new CognitoSession(
      {
        AccessToken,
        IdToken,
        RefreshToken,
      },
      prefix,
    );
  }

  /**
   * Checks to see if the session is still valid based on session expiry information found
   * in tokens and the current time (adjusted with clock drift)
   *
   * @returns if the session is still valid
   */
  isValid() {
    const now = Math.floor(new Date().getTime() / 1000);
    const adjusted = now - this.clockDrift;

    return (
      adjusted < this.accessToken?.getExpiration() &&
      adjusted < this.idToken?.getExpiration()
    );
  }

  private setSessionTokens(res: AuthenticationResult) {
    if (res.RefreshToken) {
      this.refreshToken = res.RefreshToken;
    }
    if (res.AccessToken) {
      this.accessToken = new JWTToken(res.AccessToken);
    }
    if (res.IdToken) {
      this.idToken = new JWTToken(res.IdToken);
    }
  }

  private cacheSessionTokens() {
    if (this.refreshToken) {
      this.storeToken('refreshToken', this.refreshToken);
    }
    if (this.accessToken) {
      this.storeToken('accessToken', this.accessToken.getJWTToken());
    }
    if (this.idToken) {
      this.storeToken('idToken', this.idToken.getJWTToken());
    }
  }

  private storeToken(key: string, token: string) {
    const fullKey = `${this.prefix}.${key}`;
    localStorage.setItem(fullKey, token);
  }

  private calculateClockDrift() {
    const now = Math.floor(new Date().getTime() / 1000);
    const iat = Math.min(
      this.accessToken?.getIssuedAt(),
      this.idToken?.getIssuedAt(),
    );

    return now - iat;
  }
}
