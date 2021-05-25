export const SupportedUserPoolActionArray = <const>[
  'SignUp',
  'ConfirmSignUp',
  'ForgotPassword',
  'ConfirmForgotPassword',
  'InitiateAuth',
  'RespondToAuthChallenge',
  'GetUser',
  'AssociateSoftwareToken',
];
export type SupportedUserPoolAction =
  typeof SupportedUserPoolActionArray[number];

const userPoolActionSet = new Set(SupportedUserPoolActionArray);

export const isSupportedUserPoolAction = (action: SupportedUserPoolAction) =>
  userPoolActionSet.has(action);
