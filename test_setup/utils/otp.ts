import * as OTPAuth from 'otpauth';

export const getOTPFromSecret = (secret: string) => {
  let totp = new OTPAuth.TOTP({
    issuer: 'AWSCognito',
    label: 'TestUtil',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret, // or "OTPAuth.Secret.fromBase32('NB2W45DFOIZA')"
  });
  return totp.generate();
};
