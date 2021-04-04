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
  it('will sign up new users', () => {});

  describe('#signUp', () => {
    let auth: Cognin;
    beforeEach(() => {
      auth = new Cognin();
      auth.configure({
        clientId: process.env.TEST_CLIENT_ID ?? '',
        region: 'ca-central-1',
        userPoolId: process.env.TEST_USER_POOL_ID ?? '',
      });
    });
    it('will sign up new users', async () => {
      const res = await auth.signUp({
        username: 'username1',
        password: 'Password123',
        attributes: {
          email: 'wangyonglin1999@gmail.com',
        },
      });
      console.log(res);
    });
  });
});
