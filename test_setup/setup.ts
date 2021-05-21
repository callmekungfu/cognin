import crypto from 'crypto';
import 'whatwg-fetch';

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.randomFillSync(arr),
  },
});
