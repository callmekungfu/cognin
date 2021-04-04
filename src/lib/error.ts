export interface UserPoolErrorBody {
  __type: string;
  message: string;
}

export interface UserPoolException {
  type: string;
  code: number;
  message: string;
  getHelpText: () => string;
}

export class UserPoolExceptionHandler {
  static handle(body?: UserPoolErrorBody) {
    if (body) {
      switch (body.__type) {
        case 'InvalidPasswordException':
          return new InvalidPasswordException(body.message);
        default:
          return new GenericUserPoolException(body.__type, body.message);
      }
    }
  }
}

export class InvalidPasswordException implements UserPoolException {
  type = 'InvalidPasswordException';
  message: string;
  code = 400;
  constructor(message: string) {
    this.message = message;
  }

  getHelpText() {
    return `This exception is thrown when the Amazon Cognito service encounters an invalid password.`;
  }
}

export class GenericUserPoolException implements UserPoolException {
  type = 'GenericUserPoolException';
  message: string;
  code = 500;
  constructor(type: string, message: string) {
    this.type = type;
    this.message = message;
  }

  getHelpText() {
    return `This exception is thrown when the error type is not translated properly. Please report it in https://github.com/callmekungfu/cognin.
  Type: ${this.type}
  Original Message: ${this.message}
    `;
  }
}
