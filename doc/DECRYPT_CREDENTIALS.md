# Encrypted Credentials

This file is encrypted using AES-256-CBC with PBKDF2 key derivation.

## To Decrypt

```bash
openssl enc -aes-256-cbc -d -pbkdf2 -in doc/PROJECT_CREDENTIALS_TODO.md.enc -out doc/PROJECT_CREDENTIALS_TODO.md
```

You will be prompted for the password.

## Notes
- The decrypted file should NOT be committed to git
- The decrypted file is already in `.gitignore`
