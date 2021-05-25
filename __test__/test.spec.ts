import { Cognin } from '../src/cognin';

const username = process.env.TEST_USERNAME ?? '';
const password = process.env.TEST_PASSWORD ?? '';

describe('Cognin Class Config', () => {
  it('will be constructable without any configurations', () => {
    const auth = new Cognin();
    expect(auth['userPool']).toBeFalsy();
  });
  it('will construct a user pool connection upon initialization', () => {
    const auth = new Cognin();
    auth.configure({
      clientId: process.env.TEST_CLIENT_ID ?? '',
      region: 'ca-central-1',
      userPoolId: process.env.TEST_USER_POOL_ID ?? '',
    });
    expect(auth['userPool']).toBeTruthy();
  });
});

describe('Cognin Class', () => {
  let auth: Cognin;
  beforeEach(() => {
    auth = new Cognin();
    auth.configure({
      clientId: process.env.TEST_CLIENT_ID ?? '',
      region: 'ca-central-1',
      userPoolId: process.env.TEST_USER_POOL_ID ?? '',
    });
  });

  it('will sign in to user pool', async () => {
    const user = await auth.signIn(username, password);
    expect(user).toBeTruthy();
  });
});
