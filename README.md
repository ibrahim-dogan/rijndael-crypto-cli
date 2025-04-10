# rijndael Crypto

A command-line tool for Rijndael/AES encryption and decryption.

## Installation

```bash
npm install -g rijndael-crypto
```

## Usage

Interactive mode:
```bash
npx rijndael-crypto
```

Command line mode:
```bash
npx rijndael-crypto encrypt "text" "key" "vector"
npx rijndael-crypto decrypt "encryptedBase64" "key" "vector"
```

Note: The security vector must be exactly 16 characters long.

## Options

- `--help`: Show help message

## License

MIT
