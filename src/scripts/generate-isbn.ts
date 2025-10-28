#!/usr/bin/env node

import { IsbnGeneratorUtil } from '../common/utils/isbn-generator.util';

/**
 * CLI script to generate valid ISBN numbers
 * Usage:
 *   npx ts-node src/scripts/generate-isbn.ts
 *   npx ts-node src/scripts/generate-isbn.ts 5  (generate 5 ISBNs)
 */
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 1;

console.log(`\n📚 Generating ${count} valid ISBN-13 number(s)...\n`);

try {
  if (count === 1) {
    const isbn = IsbnGeneratorUtil.generateValidISBN13();
    console.log('✅ Valid ISBN-13:');
    console.log(`   ${isbn}\n`);
    
    // Also generate ISBN-10
    const isbn10 = IsbnGeneratorUtil.generateValidISBN10();
    console.log('✅ Valid ISBN-10:');
    console.log(`   ${isbn10}\n`);
    
    // Show usage in curl command
    console.log('📋 For curl command:');
    console.log(`   "isbn": "${isbn}"\n`);
  } else {
    const isbns = IsbnGeneratorUtil.generateMultipleISBN13(count);
    console.log('✅ Valid ISBN-13 numbers:\n');
    isbns.forEach((isbn, index) => {
      console.log(`   ${index + 1}. ${isbn}`);
    });
    console.log('');
    
    // Show usage in curl command
    console.log('📋 For curl command (using first ISBN):');
    console.log(`   "isbn": "${isbns[0]}"\n`);
  }
  
  // Display helper function
  console.log('💡 Tip: You can also use this in your code:');
  console.log('   import { IsbnGeneratorUtil } from "./common/utils/isbn-generator.util";');
  console.log('   const isbn = IsbnGeneratorUtil.generateValidISBN13();\n');
} catch (error) {
  console.error('❌ Error generating ISBN:', error);
  process.exit(1);
}



