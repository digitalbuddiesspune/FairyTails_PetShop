export const MAX_IMAGE_UPLOAD_MB = 4;
export const MAX_IMAGE_UPLOAD_BYTES = MAX_IMAGE_UPLOAD_MB * 1024 * 1024;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const isImageUrl = (value) =>
  typeof value === 'string' && /^https?:\/\//i.test(value.trim());

export const uploadAdminImageFile = async (
  file,
  apiBase = import.meta.env.VITE_BACKEND_API
) => {
  if (!file) throw new Error('No file selected');

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Only JPG, PNG, WEBP, and GIF files are allowed.');
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(
      `Image must be ${MAX_IMAGE_UPLOAD_MB} MB or smaller. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`
    );
  }

  const token = localStorage.getItem('adminToken');
  if (!token) {
    throw new Error('Admin token missing. Please sign in again.');
  }

  const presignResponse = await fetch(`${apiBase}/admin/upload/presign`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

  let presignData = null;
  try {
    presignData = await presignResponse.json();
  } catch {
    throw new Error(`Failed to prepare upload (${presignResponse.status})`);
  }

  if (!presignResponse.ok || !presignData?.success) {
    throw new Error(presignData?.message || 'Failed to prepare upload');
  }

  const { uploadUrl, url, contentType } = presignData.data;

  const s3Response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType || file.type },
    body: file,
  });

  if (!s3Response.ok) {
    throw new Error(
      s3Response.status === 403
        ? 'S3 rejected upload. Ensure bucket CORS allows PUT from this site.'
        : `S3 upload failed (${s3Response.status})`
    );
  }

  return url;
};
