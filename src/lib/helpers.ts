import { Buffer } from 'buffer';

export const isEmptyObject = (obj: any) => {
  return !!obj && Object.keys(obj).length === 0;
};

export class JWTToken {
  payload: Record<string, any>;
  constructor(private rawToken: string) {
    this.payload = this.decodePayload();
  }

  getJWTToken() {
    return this.rawToken;
  }

  getExpiration() {
    return this.payload.exp;
  }

  getIssuedAt() {
    return this.payload.iat;
  }

  decodePayload() {
    const payload = this.rawToken.split('.')[1];
    try {
      return JSON.parse(Buffer.from(payload, 'base64').toString('binary'));
    } catch (err) {
      return {};
    }
  }
}
