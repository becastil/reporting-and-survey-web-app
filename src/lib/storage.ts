import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// S3 Client configuration
const s3Client = process.env.AWS_ACCESS_KEY_ID ? new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}) : null;

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'survey-platform-uploads-dev';

// File storage interface for abstraction
interface StorageProvider {
  upload(file: Buffer | Uint8Array, key: string, metadata?: Record<string, string>): Promise<{ url: string; key: string }>;
  download(key: string): Promise<Buffer>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<boolean>;
  list(prefix: string): Promise<string[]>;
}

// Local storage fallback for development
class LocalStorage implements StorageProvider {
  private basePath = '/tmp/survey-uploads';
  
  async upload(file: Buffer | Uint8Array, key: string): Promise<{ url: string; key: string }> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(this.basePath, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, file);
    
    console.log(`📁 File saved locally: ${filePath}`);
    return {
      url: `file://${filePath}`,
      key,
    };
  }
  
  async download(key: string): Promise<Buffer> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(this.basePath, key);
    return fs.readFile(filePath);
  }
  
  async getSignedUrl(key: string): Promise<string> {
    const path = await import('path');
    return `file://${path.join(this.basePath, key)}`;
  }
  
  async delete(key: string): Promise<boolean> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const filePath = path.join(this.basePath, key);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  async list(prefix: string): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dirPath = path.join(this.basePath, prefix);
    try {
      const files = await fs.readdir(dirPath);
      return files.map(f => path.join(prefix, f));
    } catch {
      return [];
    }
  }
}

// S3 storage implementation
class S3Storage implements StorageProvider {
  async upload(
    file: Buffer | Uint8Array,
    key: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; key: string }> {
    if (!s3Client) {
      throw new Error('S3 client not configured');
    }
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      Metadata: metadata,
      ServerSideEncryption: 'AES256',
    });
    
    await s3Client.send(command);
    
    console.log(`✅ File uploaded to S3: ${key}`);
    return {
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
      key,
    };
  }
  
  async download(key: string): Promise<Buffer> {
    if (!s3Client) {
      throw new Error('S3 client not configured');
    }
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    const response = await s3Client.send(command);
    const chunks: Uint8Array[] = [];
    
    // @ts-ignore - Body is a stream
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  }
  
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (!s3Client) {
      throw new Error('S3 client not configured');
    }
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    return getSignedUrl(s3Client, command, { expiresIn });
  }
  
  async delete(key: string): Promise<boolean> {
    if (!s3Client) {
      throw new Error('S3 client not configured');
    }
    
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      
      await s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
  
  async list(prefix: string): Promise<string[]> {
    if (!s3Client) {
      throw new Error('S3 client not configured');
    }
    
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 1000,
    });
    
    const response = await s3Client.send(command);
    return response.Contents?.map(obj => obj.Key!) || [];
  }
}

// Storage manager with fallback
export class StorageManager {
  private provider: StorageProvider;
  private static instance: StorageManager;
  
  constructor() {
    // Use S3 if configured, otherwise use local storage
    this.provider = s3Client ? new S3Storage() : new LocalStorage();
    
    if (!s3Client) {
      console.warn('⚠️ S3 not configured, using local file storage');
    }
  }
  
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }
  
  // Generate secure file key
  private generateKey(
    filename: string,
    folder: string,
    orgId?: string
  ): string {
    const timestamp = Date.now();
    const hash = crypto.createHash('sha256')
      .update(`${filename}-${timestamp}`)
      .digest('hex')
      .substring(0, 8);
    
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    if (orgId) {
      return `${folder}/${orgId}/${timestamp}-${hash}-${sanitizedFilename}`;
    }
    
    return `${folder}/${timestamp}-${hash}-${sanitizedFilename}`;
  }
  
  // Upload CSV file
  async uploadCSV(
    file: Buffer | Uint8Array,
    filename: string,
    orgId: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; key: string }> {
    const key = this.generateKey(filename, 'csv-uploads', orgId);
    
    return this.provider.upload(file, key, {
      ...metadata,
      contentType: 'text/csv',
      uploadedAt: new Date().toISOString(),
      organizationId: orgId,
    });
  }
  
  // Upload report
  async uploadReport(
    file: Buffer | Uint8Array,
    filename: string,
    orgId: string,
    reportType: string
  ): Promise<{ url: string; key: string }> {
    const key = this.generateKey(filename, 'reports', orgId);
    
    return this.provider.upload(file, key, {
      contentType: 'application/pdf',
      reportType,
      organizationId: orgId,
      generatedAt: new Date().toISOString(),
    });
  }
  
  // Upload export
  async uploadExport(
    file: Buffer | Uint8Array,
    filename: string,
    format: 'csv' | 'excel' | 'json'
  ): Promise<{ url: string; key: string }> {
    const contentTypes = {
      csv: 'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      json: 'application/json',
    };
    
    const key = this.generateKey(filename, 'exports');
    
    return this.provider.upload(file, key, {
      contentType: contentTypes[format],
      format,
      exportedAt: new Date().toISOString(),
    });
  }
  
  // Get download URL (expires in 1 hour by default)
  async getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.provider.getSignedUrl(key, expiresIn);
  }
  
  // Download file
  async download(key: string): Promise<Buffer> {
    return this.provider.download(key);
  }
  
  // Delete file
  async delete(key: string): Promise<boolean> {
    return this.provider.delete(key);
  }
  
  // List files with prefix
  async list(prefix: string): Promise<string[]> {
    return this.provider.list(prefix);
  }
  
  // Clean up old files (for cron job)
  async cleanupOldFiles(daysOld = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const folders = ['csv-uploads', 'exports', 'reports'];
    let deletedCount = 0;
    
    for (const folder of folders) {
      const files = await this.list(folder);
      
      for (const file of files) {
        // Extract timestamp from filename
        const match = file.match(/\/(\d+)-/);
        if (match) {
          const timestamp = parseInt(match[1]);
          const fileDate = new Date(timestamp);
          
          if (fileDate < cutoffDate) {
            const deleted = await this.delete(file);
            if (deleted) deletedCount++;
          }
        }
      }
    }
    
    console.log(`🗑️ Cleaned up ${deletedCount} old files`);
    return deletedCount;
  }
}

// Export singleton instance
export const storage = StorageManager.getInstance();