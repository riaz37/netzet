import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isISBN', async: false })
export class IsISBNConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, _args: ValidationArguments) {
    if (typeof value !== 'string') {
      return false;
    }

    const cleanISBN = value.replace(/[-\s]/g, '');

    return this.isValidISBN10(cleanISBN) || this.isValidISBN13(cleanISBN);
  }

  private isValidISBN10(isbn: string): boolean {
    if (isbn.length !== 10) {
      return false;
    }

    if (!/^\d{9}[\dX]$/.test(isbn)) {
      return false;
    }

    // ISBN-10 checksum: sum of digits multiplied by position weight, mod 11
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn[i]) * (10 - i);
    }

    const checkDigit = isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
    return (sum + checkDigit) % 11 === 0;
  }

  private isValidISBN13(isbn: string): boolean {
    if (isbn.length !== 13) {
      return false;
    }

    if (!/^\d{13}$/.test(isbn)) {
      return false;
    }

    // ISBN-13 checksum: alternating 1 and 3 multipliers, mod 10
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(isbn[i]);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(isbn[12]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'isbn must be a valid ISBN-10 or ISBN-13 format';
  }
}

export function IsISBN(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsISBNConstraint,
    });
  };
}
