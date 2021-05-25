import { Cognin } from '../src/cognin';
import { CognitoUser } from '../src/lib/user';

const username = process.env.TEST_USERNAME ?? '';
const password = process.env.TEST_PASSWORD ?? '';

describe('Cognin User', () => {
  let auth: Cognin;
  let user: CognitoUser;
  beforeEach(async () => {
    auth = new Cognin();
    auth.configure({
      clientId: process.env.TEST_CLIENT_ID ?? '',
      region: 'ca-central-1',
      userPoolId: process.env.TEST_USER_POOL_ID ?? '',
    });
    user = (await auth.signIn(username, password)) as any;
  });

  it('will fetch user attributes after sign in', async () => {
    const res = await user.getUserAttributes();
    expect(res).toBeTruthy();
  });

  it('will fetch user attributes from cache', async () => {
    const map = await user.getUserAttributeMap();
    expect(map.sub).toBeTruthy();
  });

  it('will request code for creating TOTP token', async () => {
    const res = await user.setupTOTP();
    expect(res).toBeTruthy();
  });
});
