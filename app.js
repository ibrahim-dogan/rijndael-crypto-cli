#!/usr/bin/env node

import crypto from 'crypto';
import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import pkg from 'enquirer';
const { Select } = pkg;

// Rijndael/AES encryption and decryption class
class RijndaelCrypt {
  constructor(key, securityVector) {
    if (securityVector.length !== 16) {
      throw new Error("Security vector must be 16 characters long.");
    }

    const digest = crypto.createHash('md5');
    const keyBytes = Buffer.from(key);
    const keyHash = digest.update(keyBytes).digest();

    this._password = keyHash;
    this._IVParamSpec = Buffer.from(securityVector);
  }

  encrypt(text) {
    try {
      const cipher = crypto.createCipheriv('aes-128-cbc', this._password, this._IVParamSpec);
      let encrypted = cipher.update(text, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
    } catch (error) {
      throw new Error("Encryption failed. Please check your inputs.");
    }
  }

  decrypt(text) {
    try {
      const decipher = crypto.createDecipheriv('aes-128-cbc', this._password, this._IVParamSpec);
      const decodedValue = Buffer.from(text, 'base64');
      let decrypted = decipher.update(decodedValue, null, 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error("Decryption failed. Please check your inputs.");
    }
  }
}

// Main function
async function main() {
  console.log(chalk.bold.green("\nRijndael/AES Encryption/Decryption Tool"));
  console.log(chalk.green("========================================\n"));

  const modePrompt = new Select({
    name: 'mode',
    message: 'Choose operation',
    choices: ['encrypt', 'decrypt'],
    pointer: '▸',
    symbols: { pointer: '▸' }
  });

  let mode;
  try {
    mode = await modePrompt.run();
  } catch (error) {
    console.error(chalk.red('Operation cancelled'));
    process.exit(1);
  }

  // Create readline interface only after mode selection
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Modified ask function to use the local rl instance
  const ask = (question) => {
    return new Promise((resolve) => {
      rl.question(chalk.cyan(question), (answer) => {
        resolve(answer);
      });
    });
  };

  try {
    const text = await ask(mode === 'encrypt' ? "Enter the text to encrypt: " : "Enter the encrypted text (Base64 encoded): ");
    const key = await ask("Enter the encryption key (any length): ");
    const securityVector = await ask("Enter the security vector (must be 16 characters): ");

    if (securityVector.length !== 16) {
      console.error(chalk.red("Error: Security vector must be exactly 16 characters long."));
      rl.close();
      return;
    }

    const spinner = ora('Processing...').start();

    try {
      const rijndael = new RijndaelCrypt(key, securityVector);
      let result;

      if (mode === 'encrypt') {
        result = rijndael.encrypt(text);
        spinner.succeed(chalk.green("Encryption successful!"));
        console.log(chalk.bold("Encrypted text (Base64):"), chalk.yellow(result));
      } else {
        result = rijndael.decrypt(text);
        spinner.succeed(chalk.green("Decryption successful!"));
        console.log(chalk.bold("Decrypted text:"), chalk.yellow(result));
      }
    } catch (error) {
      spinner.fail(chalk.red(error.message));
    }
  } finally {
    rl.close();
  }
}

// Command-line argument handling
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(chalk.bold.green("\nRijndael/AES Encryption/Decryption Tool"));
  console.log(chalk.green("========================================\n"));
  console.log("Usage:");
  console.log("  npx rijndael-crypto encrypt \"text\" \"key\" \"vector\"");
  console.log("  npx rijndael-crypto decrypt \"encryptedBase64\" \"key\" \"vector\"");
  console.log("\nOptions:");
  console.log("  --help    Show this help message\n");
  process.exit(0);
}

if (args.length > 0 && (args[0] === 'encrypt' || args[0] === 'decrypt')) {
  if (args.length < 4) {
    console.error(chalk.red('Error: Missing arguments.'));
    console.log(chalk.green('Usage: npx rijndael-crypto encrypt "text" "key" "vector"'));
    process.exit(1);
  }

  const mode = args[0];
  const text = args[1];
  const key = args[2];
  const vector = args[3];

  if (vector.length !== 16) {
    console.error(chalk.red("Error: Security vector must be exactly 16 characters long."));
    process.exit(1);
  }

  try {
    const rijndael = new RijndaelCrypt(key, vector);
    if (mode === 'encrypt') {
      const encrypted = rijndael.encrypt(text);
      console.log(chalk.bold("Encrypted text (Base64):"), chalk.yellow(encrypted));
    } else {
      const decrypted = rijndael.decrypt(text);
      console.log(chalk.bold("Decrypted text:"), chalk.yellow(decrypted));
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
} else {
  main();
}