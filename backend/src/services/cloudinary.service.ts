import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { generateWatermarkSvg } from "../utils/watermark.js";
import { logger } from "../utils/logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

export class CloudinaryService {
  /**
   * Processes raw upload buffer: auto-rotates EXIF, resizes, overlays centered semi-transparent watermark,
   * converts to WebP, and uploads to Cloudinary.
   */
  public async uploadPropertyImage(
    fileBuffer: Buffer,
    propertyId: string,
  ): Promise<UploadResult> {
    try {
      const sharpInstance = sharp(fileBuffer).rotate();
      const metadata = await sharpInstance.metadata();

      const origWidth = metadata.width || 1200;
      const origHeight = metadata.height || 900;

      const maxDimension = 1600;
      let targetWidth = origWidth;
      let targetHeight = origHeight;

      if (origWidth > maxDimension || origHeight > maxDimension) {
        if (origWidth > origHeight) {
          targetWidth = maxDimension;
          targetHeight = Math.round((origHeight / origWidth) * maxDimension);
        } else {
          targetHeight = maxDimension;
          targetWidth = Math.round((origWidth / origHeight) * maxDimension);
        }
      }

      // Generate large, light semi-transparent watermark
      const watermarkBuffer = generateWatermarkSvg(targetWidth, targetHeight);

      const processedBuffer = await sharpInstance
        .resize(targetWidth, targetHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .composite([
          {
            input: watermarkBuffer,
            gravity: "center", // Positioned directly at the center of the photo
          },
        ])
        .webp({
          quality: 80,
          effort: 4,
          smartSubsample: true,
        })
        .toBuffer();

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `awtarprop/properties/${propertyId}`,
            format: "webp",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              logger.error("Cloudinary Upload Stream Error:", error);
              return reject(error || new Error("Cloudinary upload failed"));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          },
        );

        uploadStream.end(processedBuffer);
      });
    } catch (error) {
      logger.error("Sharp Processing Exception:", error);
      throw error;
    }
  }

  public async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
    }
  }
}

export const cloudinaryService = new CloudinaryService();
