// Check if S3 is enabled (has credentials)
const S3_ENABLED = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET;

let AWS, s3, BUCKET_NAME;

// Only load AWS SDK if credentials are provided
if (S3_ENABLED) {
  AWS = require('aws-sdk');
  BUCKET_NAME = process.env.AWS_S3_BUCKET;
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  console.log('✅ S3 storage enabled');
} else {
  console.log('ℹ️  S3 not configured - using in-memory file storage');
}

// In-memory file storage (fallback when S3 not configured)
const fileStorage = new Map();

class S3Service {
  /**
   * Upload a file to S3 or memory
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - File MIME type
   * @param {string} sessionId - Session ID
   * @returns {Object} Upload result with key and location
   */
  async uploadFile(fileBuffer, originalName, mimeType, sessionId) {
    const timestamp = Date.now();
    const fileKey = `sessions/${sessionId}/${timestamp}-${originalName}`;

    if (S3_ENABLED) {
      // Upload to S3
      const params = {
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256'
      };

      try {
        const result = await s3.upload(params).promise();
        console.log(`✅ File uploaded to S3: ${fileKey}`);
        return {
          key: fileKey,
          location: result.Location,
          bucket: BUCKET_NAME
        };
      } catch (error) {
        console.error('❌ S3 upload failed:', error.message);
        throw new Error('File upload failed');
      }
    } else {
      // Store in memory
      fileStorage.set(fileKey, {
        buffer: fileBuffer,
        originalName,
        mimeType,
        sessionId,
        uploadedAt: new Date()
      });
      console.log(`✅ File stored in memory: ${fileKey}`);
      return {
        key: fileKey,
        location: `memory://${fileKey}`,
        bucket: 'memory'
      };
    }
  }

  /**
   * Download a file from S3 or memory
   * @param {string} fileKey - S3 object key or memory key
   * @returns {Buffer} File buffer
   */
  async downloadFile(fileKey) {
    if (S3_ENABLED) {
      // Get from S3
      const params = {
        Bucket: BUCKET_NAME,
        Key: fileKey
      };

      try {
        const data = await s3.getObject(params).promise();
        console.log(`✅ File downloaded from S3: ${fileKey}`);
        return data.Body;
      } catch (error) {
        console.error('❌ S3 download failed:', error.message);
        throw new Error('File download failed');
      }
    } else {
      // Get from memory
      const fileData = fileStorage.get(fileKey);
      if (!fileData) {
        throw new Error('File not found');
      }
      console.log(`✅ File retrieved from memory: ${fileKey}`);
      return fileData.buffer;
    }
  }

  /**
   * Delete a file from S3 or memory
   * @param {string} fileKey - S3 object key or memory key
   */
  async deleteFile(fileKey) {
    if (S3_ENABLED) {
      // Delete from S3
      const params = {
        Bucket: BUCKET_NAME,
        Key: fileKey
      };

      try {
        await s3.deleteObject(params).promise();
        console.log(`🗑️  File deleted from S3: ${fileKey}`);
      } catch (error) {
        console.error('❌ S3 delete failed:', error.message);
      }
    } else {
      // Delete from memory
      fileStorage.delete(fileKey);
      console.log(`🗑️  File deleted from memory: ${fileKey}`);
    }
  }

  /**
   * Delete all files for a session from S3 or memory
   * @param {string} sessionId - Session ID
   */
  async deleteSessionFiles(sessionId) {
    if (S3_ENABLED) {
      // Delete from S3
      const params = {
        Bucket: BUCKET_NAME,
        Prefix: `sessions/${sessionId}/`
      };

      try {
        const listedObjects = await s3.listObjectsV2(params).promise();

        if (listedObjects.Contents.length === 0) {
          console.log(`ℹ️  No files to delete for session ${sessionId}`);
          return;
        }

        const deleteParams = {
          Bucket: BUCKET_NAME,
          Delete: {
            Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
          }
        };

        await s3.deleteObjects(deleteParams).promise();
        console.log(`🗑️  Deleted ${listedObjects.Contents.length} files for session ${sessionId}`);
      } catch (error) {
        console.error('❌ S3 session cleanup failed:', error.message);
      }
    } else {
      // Delete from memory
      let deletedCount = 0;
      for (const [key, value] of fileStorage.entries()) {
        if (value.sessionId === sessionId) {
          fileStorage.delete(key);
          deletedCount++;
        }
      }
      if (deletedCount > 0) {
        console.log(`🗑️  Deleted ${deletedCount} files from memory for session ${sessionId}`);
      }
    }
  }

  /**
   * Get a presigned URL for direct download (expires in 5 minutes)
   * For memory storage, returns an API endpoint path
   * @param {string} fileKey - S3 object key or memory key
   * @returns {string} Presigned URL or endpoint path
   */
  getPresignedUrl(fileKey) {
    if (S3_ENABLED) {
      const params = {
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Expires: 300 // 5 minutes
      };
      return s3.getSignedUrl('getObject', params);
    } else {
      // For memory storage, return the download endpoint path
      return `/api/shopkeeper/files/download/${encodeURIComponent(fileKey)}`;
    }
  }
}

module.exports = new S3Service();
