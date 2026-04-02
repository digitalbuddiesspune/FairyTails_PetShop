import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const sanitizeFileName = (name = '') =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-');

export const uploadAdminImage = async (req, res) => {
  try {
    const region = process.env.AWS_BUCKET_REGION || process.env.AWS_REGION;
    const bucket = process.env.AWS_BUCKET_NAME;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    const s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      return res.status(500).json({
        success: false,
        message:
          'S3 is not configured. Check AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME and AWS_REGION/AWS_BUCKET_REGION.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Use field name "image".',
      });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only JPG, PNG, WEBP, and GIF files are allowed.',
      });
    }

    const ext = req.file.originalname?.split('.').pop() || 'jpg';
    const key = `products/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(
      req.file.originalname || `image.${ext}`
    )}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const imageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { url: imageUrl, key },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

