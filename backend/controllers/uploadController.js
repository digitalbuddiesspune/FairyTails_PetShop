import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const sanitizeFileName = (name = '') =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-');

const getS3Config = () => {
  const region = process.env.AWS_BUCKET_REGION || process.env.AWS_REGION;
  const bucket = process.env.AWS_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    return {
      error:
        'S3 is not configured. Check AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME and AWS_REGION/AWS_BUCKET_REGION.',
    };
  }

  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  return { client, bucket, region };
};

const getCloudFrontBaseUrl = () =>
  (process.env.CLOUDFRONT_URL || 'https://cdn.fairytailspetshop.com').replace(/\/+$/, '');

const buildProductImageKey = (fileName = 'image.jpg', contentType = 'image/jpeg') => {
  const extFromName = fileName?.split('.').pop()?.toLowerCase();
  const extFromMime = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }[contentType];
  const ext = extFromName || extFromMime || 'jpg';

  return `products/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(
    fileName || `image.${ext}`
  )}`;
};

const validateImageUploadMeta = ({ contentType, fileSize }) => {
  if (!contentType || !ALLOWED_MIME_TYPES.has(contentType)) {
    return 'Only JPG, PNG, WEBP, and GIF files are allowed.';
  }

  const size = Number(fileSize);
  if (!Number.isFinite(size) || size <= 0) {
    return 'Invalid file size.';
  }
  if (size > MAX_IMAGE_UPLOAD_BYTES) {
    return 'Image must be 4 MB or smaller.';
  }

  return null;
};

/** Presigned PUT URL — browser uploads directly to S3; API only signs the request. */
export const createAdminImagePresign = async (req, res) => {
  try {
    const { fileName, contentType, fileSize } = req.body || {};
    const validationError = validateImageUploadMeta({ contentType, fileSize });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const s3 = getS3Config();
    if (s3.error) {
      return res.status(500).json({ success: false, message: s3.error });
    }

    const key = buildProductImageKey(fileName, contentType);
    const command = new PutObjectCommand({
      Bucket: s3.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3.client, command, { expiresIn: 300 });
    const publicUrl = `${getCloudFrontBaseUrl()}/${key}`;

    return res.status(200).json({
      success: true,
      message: 'Presigned upload URL created',
      data: {
        uploadUrl,
        key,
        url: publicUrl,
        contentType,
        expiresIn: 300,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create upload URL',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/** Legacy proxy upload through API (optional fallback). */
export const uploadAdminImage = async (req, res) => {
  try {
    const s3 = getS3Config();
    if (s3.error) {
      return res.status(500).json({ success: false, message: s3.error });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Use field name "image".',
      });
    }

    const validationError = validateImageUploadMeta({
      contentType: req.file.mimetype,
      fileSize: req.file.size,
    });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const key = buildProductImageKey(req.file.originalname, req.file.mimetype);

    await s3.client.send(
      new PutObjectCommand({
        Bucket: s3.bucket,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const imageUrl = `${getCloudFrontBaseUrl()}/${key}`;
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
