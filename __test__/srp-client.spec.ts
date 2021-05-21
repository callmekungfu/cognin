import { SRPClient } from '../src/lib/srp-client';
import { UserPool } from '../src/lib/cognito-connector';

const username = process.env.TEST_USERNAME ?? '';
const password = process.env.TEST_PASSWORD ?? '';
const clientId = process.env.TEST_CLIENT_ID ?? '';
const userPoolId = process.env.TEST_USER_POOL_ID ?? '';

describe('SRP Client', () => {
  it('will generate a random hex of 128 bytes', () => {
    const client = new SRPClient();
    const actual = client.generateRandomHex(128);

    expect(actual.length).toEqual(256);
  });

  it('will generate a random small A value', () => {
    const client = new SRPClient();
    expect(client.a).toBeTruthy();
  });

  it('will authenticate with SRP', async () => {
    const client = new SRPClient();
    const pool = new UserPool({
      clientId,
      region: 'ca-central-1',
      userPoolId,
      clientMetadata: {},
    });

    const res = await client.authenticate(pool, username, password);
    expect(res).toBeTruthy();
  });
});
