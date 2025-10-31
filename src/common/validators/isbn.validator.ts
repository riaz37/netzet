import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isISBN', async: false })
export class IsISBNConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') {
      return false;
    }

    // Remove all hyphens and spaces
    const cleanISBN = value.replace(/[-\s]/g, '');

    // Check if it's a valid ISBN-10 or ISBN-13
    return this.isValidISBN10(cleanISBN) || this.isValidISBN13(cleanISBN);
  }

  private isValidISBN10(isbn: string): boolean {
    if (isbn.length !== 10) {
      return false;
    }

    // Check if all characters are digits except possibly the last one (which can be X)
    if (!/^\d{9}[\dX]$/.test(isbn)) {
      return false;
    }

    // Calculate checksum
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

    // Check if all characters are digits
    if (!/^\d{13}$/.test(isbn)) {
      return false;
    }

    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(isbn[i]);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(isbn[12]);
  }

  defaultMessage(args: ValidationArguments) {
    return 'isbn must be a valid ISBN-10 or ISBN-13 format';
  }
}

export function IsISBN(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsISBNConstraint,
    });
  };
}
