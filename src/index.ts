import { Cognin } from './cognin';

let instance: Cognin | null = null;

if (!instance) {
  instance = new Cognin();
}

const Auth = instance;

export default Auth;
export { Cognin };
