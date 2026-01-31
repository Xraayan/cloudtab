import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ALGORITHM = 'aes-256-cbc';

// Generate a random encryption key (32 bytes for AES-256)
export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Encrypt a file
export function encryptFile(inputPath, outputPath, encryptionKey) {
  return new Promise((resolve, reject) => {
    const key = Buffer.from(encryptionKey, 'hex');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    // Write IV at the beginning of the encrypted file
    output.write(iv);

    input.pipe(cipher).pipe(output);

    output.on('finish', () => resolve());
    output.on('error', reject);
    input.on('error', reject);
  });
}

// Decrypt a file
export function decryptFile(inputPath, outputPath, encryptionKey) {
  return new Promise((resolve, reject) => {
    const key = Buffer.from(encryptionKey, 'hex');

    // Read the IV from the encrypted file
    const input = fs.createReadStream(inputPath);
    let iv;
    let firstChunk = true;

    input.on('data', (chunk) => {
      if (firstChunk) {
        iv = chunk.slice(0, 16);
        firstChunk = false;

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        const output = fs.createWriteStream(outputPath);

        // Recreate the stream without the IV
        const remaining = chunk.slice(16);
        input.pause();

        decipher.write(remaining);
        input.pipe(decipher).pipe(output);

        output.on('finish', () => resolve());
        output.on('error', reject);
        decipher.on('error', reject);

        input.resume();
      }
    });

    input.on('error', reject);
  });
}

// Securely delete a file by overwriting it before deletion
export function secureDelete(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') resolve();
        else reject(err);
        return;
      }

      const fileSize = stats.size;
      const overwrites = 3; // Overwrite 3 times

      let completed = 0;

      for (let i = 0; i < overwrites; i++) {
        const randomData = crypto.randomBytes(fileSize);
        fs.writeFile(filePath, randomData, (err) => {
          if (err) reject(err);
          completed++;

          if (completed === overwrites) {
            fs.unlink(filePath, (err) => {
              if (err) reject(err);
              else resolve();
            });
          }
        });
      }
    });
  });
}

// Securely delete a directory recursively
export function secureDeleteDirectory(dirPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dirPath)) {
      resolve();
      return;
    }

    fs.readdir(dirPath, async (err, files) => {
      if (err) reject(err);

      let completed = 0;
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          await secureDeleteDirectory(filePath);
        } else {
          await secureDelete(filePath);
        }
        completed++;
      }

      fs.rmdir(dirPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}
