#!/usr/bin/env node

/**
 * CloudTab Encryption Key Generator
 * Generates a secure 256-bit (64 character hex) encryption key
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function generateEncryptionKey() {
  // Generate 32 bytes (256 bits) of random data
  const randomBytes = crypto.randomBytes(32);
  const hexKey = randomBytes.toString('hex');
  return hexKey;
}

function updateEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  let envContent = '';
  
  // Try to read existing .env file
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } else if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf-8');
  }
  
  const encryptionKey = generateEncryptionKey();
  
  // Replace or add ENCRYPTION_KEY
  if (envContent.includes('ENCRYPTION_KEY=')) {
    envContent = envContent.replace(
      /ENCRYPTION_KEY=.*/,
      `ENCRYPTION_KEY=${encryptionKey}`
    );
  } else {
    envContent += `\nENCRYPTION_KEY=${encryptionKey}\n`;
  }
  
  // Write .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Encryption key generated and saved to .env');
  console.log(`🔑 Key: ${encryptionKey}`);
  console.log(`📝 Length: ${encryptionKey.length} characters (256 bits)\n`);
  
  return encryptionKey;
}

// Main
console.log('\n╔════════════════════════════════════════════╗');
console.log('║   CloudTab Encryption Key Generator       ║');
console.log('╚════════════════════════════════════════════╝\n');

const key = updateEnvFile();
console.log('ℹ️  This key is used for AES-256-CBC encryption');
console.log('⚠️  Keep this key safe! If lost, encrypted files cannot be decrypted\n');
