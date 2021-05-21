import randomBytes from 'randombytes';
import { sha256 } from 'sha.js';
import { Buffer } from 'buffer';
import createHmac from 'create-hmac';
import { BigInteger } from './big-integer';
import { UserPool } from './cognito-connector';
import { N, g, infoBits } from './constants';
import DateHelper from './date';

export class SRPClient {
  a: BigInteger;
  k: BigInteger;
  A: BigInteger | null = null;
  U: BigInteger | null = null;
  AHash: Buffer | null = null;
  UHexHash: String | null = null;
  constructor() {
    this.a = this.generateRandomSmallA();
    this.k = new BigInteger(
      this.hexHash(`00${N.toString(16)}0${g.toString(16)}`),
      16,
    );
  }

  async authenticate(userPool: UserPool, username: string, password: string) {
    const authParams: Record<string, string> = {};
    let salt: BigInteger;
    let B: BigInteger;
    this.A = this.calculateA();
    authParams.USERNAME = username;
    authParams.SRP_A = this.A.toBuffer().toString('hex');

    const res = await userPool.initiateAuth(authParams, 'USER_SRP_AUTH');

    const challengeParams = res.ChallengeParameters;
    if (!challengeParams) {
      throw new Error('Authentication Failed. No challenge parameters found.');
    }

    salt = new BigInteger(challengeParams.SALT, 16);
    B = new BigInteger(challengeParams.SRP_B, 16);

    // TODO implement device key system

    if (B.mod(N).equals(BigInteger.ZERO)) {
      throw new Error('Authentication Failed. B cannot be zero.');
    }

    this.U = this.calculateU(this.A, B);

    if (this.U.equals(BigInteger.ZERO)) {
      throw new Error('Authentication Failed. U cannot be zero.');
    }

    const usernamePassword = `${
      userPool.userPoolId.split('_')[1]
    }${username}:${password}`;

    const usernamePasswordHash = this.hash(usernamePassword);

    const xValue = new BigInteger(
      this.hexHash(this.padHex(salt) + usernamePasswordHash),
      16,
    );

    const s = this.calculateS(xValue, B);
    const hkdf = this.computeHKDF(
      Buffer.from(this.padHex(s), 'hex'),
      Buffer.from(this.padHex(this.U), 'hex'),
    );

    const now = DateHelper.getNowString();

    const signatureBuffer = Buffer.concat([
      Buffer.from(userPool.userPoolId.split('_')[1], 'utf-8'),
      Buffer.from(username, 'utf-8'),
      Buffer.from(challengeParams.SECRET_BLOCK, 'base64'),
      Buffer.from(now, 'utf-8'),
    ]);
    const signature = createHmac('sha256', hkdf)
      .update(signatureBuffer)
      .digest('base64');

    const challengeRes: Record<string, string> = {};
    challengeRes.USERNAME = username;
    challengeRes.PASSWORD_CLAIM_SECRET_BLOCK = challengeParams.SECRET_BLOCK;
    challengeRes.TIMESTAMP = now;
    challengeRes.PASSWORD_CLAIM_SIGNATURE = signature;

    // TODO implement device key in challengeRes

    return userPool.respondToAuthChallenge(
      'PASSWORD_VERIFIER',
      challengeRes,
      res.Session,
    );
  }

  /**
   * Generate a random hex to a multiplication of 32.
   *
   * For example. If you want to generate a random 128bit hex, pass in the value 4
   * as the argument.
   *
   * @param degree The degree to which the generated number is
   */
  generateRandomHex(size: number = 1): string {
    const bytes = randomBytes(size);

    return bytes.toString('hex');
  }

  generateRandomSmallA() {
    const hex = this.generateRandomHex(128);
    const random = new BigInteger(hex, 16);
    return random.mod(N);
  }

  computeHKDF(ikm: Buffer, salt: Buffer) {
    const prk = createHmac('sha256', salt).update(ikm).digest();
    const infoBitsUpdate = Buffer.concat([
      infoBits,
      Buffer.from(String.fromCharCode(1), 'utf8'),
    ]);
    const hmac = createHmac('sha256', prk).update(infoBitsUpdate).digest();
    return hmac.slice(0, 16);
  }

  calculateA() {
    if (!this.A) {
      const A = g.modPow(this.a, N);

      if (A.mod(N).equals(BigInteger.ZERO)) {
        throw new Error(
          'Authentication Failed. The result of A mod N cannot be 0',
        );
      }
      this.A = A;
    }

    return this.A;
  }

  calculateU(A: BigInteger, B: BigInteger) {
    const uHex = (this.UHexHash = this.hexHash(
      this.padHex(A) + this.padHex(B),
    ));
    const finalU = new BigInteger(uHex, 16);

    return finalU;
  }

  calculateS(xValue: BigInteger, B: BigInteger) {
    const gModPowXN = g.modPow(xValue, N);
    const intVal2 = B.subtract(this.k.multiply(gModPowXN));
    if (!this.U) {
      throw new Error('Authentication Failed. U value is not defined');
    }
    const result = intVal2.modPow(this.a.add(this.U?.multiply(xValue)), N);
    return result.mod(N);
  }

  hexHash(hexStr: string) {
    return this.hash(Buffer.from(hexStr, 'hex'));
  }

  hash(buf: Buffer | string) {
    const hexHash = new sha256().update(buf).digest('hex');
    return new Array(64 - hexHash.length).join('0') + hexHash;
  }

  /**
   * Converts a BigInteger (or hex string) to hex format padded with zeroes for hashing
   * @param {BigInteger|String} bigInt Number or string to pad.
   * @returns {String} Padded hex string.
   */
  padHex(bigInt: BigInteger) {
    let hashStr = bigInt.toString(16);
    if (hashStr.length % 2 === 1) {
      hashStr = `0${hashStr}`;
    } else if ('89ABCDEFabcdef'.indexOf(hashStr[0]) !== -1) {
      hashStr = `00${hashStr}`;
    }
    return hashStr;
  }
}
