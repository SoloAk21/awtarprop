import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { logger } from '../utils/logger.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  public async uploadPropertyImage(
    fileBuffer: Buffer,
    propertyId: string
  ): Promise<{ url: string; publicId: string }> {
    try {
      const optimizedWebpBuffer = await sharp(fileBuffer)
        .resize({
          width: 1200,
          height: 900,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `awtarprop/properties/${propertyId}`,
            format: 'webp',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              logger.error(
                `Cloudinary Upload Error: ${error?.message ?? 'Upload failed'}`
              );
              return reject(error || new Error('Upload failed'));
            }

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        );

        uploadStream.end(optimizedWebpBuffer);
      });
    } catch (error) {
      logger.error(
        `Sharp Image Processing Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
