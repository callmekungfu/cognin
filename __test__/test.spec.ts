import { hello } from '../src';

test('hello world', () => {
  expect(hello('test')).toEqual('Hello test!');
});
