import { Cognin } from '../src/cognin';

describe('Cognin Class', () => {
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
