/**
 * Utility class for generating and validating ISBN numbers
 */
export class IsbnGeneratorUtil {
  /**
   * Generates a random valid ISBN-13 number
   * @param groupIdentifier - Optional group identifier (first digit after 978 prefix, default: random)
   * @returns A valid ISBN-13 string with hyphens
   */
  static generateValidISBN13(groupIdentifier?: number): string {
    const publisher = this.generateRandomNumber(1000, 9999).toString();
    const title = this.generateRandomNumber(1000, 9999).toString();

    const prefix = '978';
    const group = (
      groupIdentifier || this.generateRandomNumber(0, 9)
    ).toString();
    const isbnWithoutCheck = prefix + group + publisher + title;

    if (isbnWithoutCheck.length !== 12) {
      throw new Error(
        `Invalid ISBN structure: expected 12 digits, got ${isbnWithoutCheck.length} (${isbnWithoutCheck})`,
      );
    }

    // ISBN-13 checksum: alternating 1 and 3 multipliers
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(isbnWithoutCheck[i]);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;

    const validISBN = isbnWithoutCheck + checkDigit;

    return (
      validISBN.substring(0, 3) +
      '-' +
      validISBN.substring(3, 4) +
      '-' +
      validISBN.substring(4, 8) +
      '-' +
      validISBN.substring(8, 12) +
      '-' +
      validISBN.substring(12)
    );
  }

  /**
   * Generates a random valid ISBN-10 number
   * @returns A valid ISBN-10 string with hyphens
   */
  static generateValidISBN10(): string {
    const group = this.generateRandomNumber(1, 9).toString();
    const publisher = this.generateRandomNumber(100, 999).toString();
    const title = this.generateRandomNumber(10000, 99999).toString();

    const isbnWithoutCheck = group + publisher + title;

    if (isbnWithoutCheck.length !== 9) {
      throw new Error(
        `Invalid ISBN-10 structure: expected 9 digits, got ${isbnWithoutCheck.length} (${isbnWithoutCheck})`,
      );
    }

    // ISBN-10 checksum: sum of digits multiplied by position weight (10-i), mod 11
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      const digit = parseInt(isbnWithoutCheck[i]);
      if (isNaN(digit)) {
        throw new Error(
          `Invalid digit at position ${i}: ${isbnWithoutCheck[i]} in ${isbnWithoutCheck}`,
        );
      }
      sum += digit * (10 - i);
    }

    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;
    const checkChar = checkDigit === 10 ? 'X' : checkDigit.toString();

    if (isNaN(checkDigit) || checkDigit < 0 || checkDigit > 10) {
      throw new Error(
        `Invalid check digit calculation: ${checkDigit} for sum ${sum}`,
      );
    }

    const validISBN = isbnWithoutCheck + checkChar;

    return (
      validISBN.substring(0, 1) +
      '-' +
      validISBN.substring(1, 4) +
      '-' +
      validISBN.substring(4, 9) +
      '-' +
      validISBN.substring(9)
    );
  }

  /**
   * Validates if an ISBN (with or without hyphens) is valid
   * @param isbn - ISBN to validate
   * @returns True if valid, false otherwise
   */
  static isValid(isbn: string): boolean {
    const cleanISBN = isbn.replace(/[-\s]/g, '');

    if (cleanISBN.length === 10) {
      return this.isValidISBN10(cleanISBN);
    } else if (cleanISBN.length === 13) {
      return this.isValidISBN13(cleanISBN);
    }
    return false;
  }

  /**
   * Validates ISBN-10 format
   */
  private static isValidISBN10(isbn: string): boolean {
    if (isbn.length !== 10) return false;
    if (!/^\d{9}[\dX]$/.test(isbn)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn[i]) * (10 - i);
    }

    const checkDigit = isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
    return (sum + checkDigit) % 11 === 0;
  }

  /**
   * Validates ISBN-13 format
   */
  private static isValidISBN13(isbn: string): boolean {
    if (isbn.length !== 13) return false;
    if (!/^\d{13}$/.test(isbn)) return false;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(isbn[i]);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(isbn[12]);
  }

  /**
   * Generates a random number between min and max (inclusive)
   */
  private static generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates multiple unique valid ISBN-13 numbers
   * @param count - Number of ISBNs to generate
   * @returns Array of valid ISBN-13 strings
   */
  static generateMultipleISBN13(count: number): string[] {
    const isbns = new Set<string>();
    for (let i = 0; i < count; i++) {
      isbns.add(this.generateValidISBN13());
    }
    return Array.from(isbns);
  }
}
