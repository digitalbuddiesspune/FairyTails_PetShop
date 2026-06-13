import { useState } from 'react';
import {
  isImageUrl,
  MAX_IMAGE_UPLOAD_MB,
  uploadAdminImageFile,
} from '../utils/adminImageUpload';

const AdminImageUrlField = ({
  label = 'Image URL',
  value = '',
  onChange,
  onError,
  required = false,
  placeholder = 'https://...',
  previewWrapperClassName = 'w-32 h-32',
  showPreview = true,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file) return;
    setUploading(true);
    onError?.('');
    try {
      const url = await uploadAdminImageFile(file);
      onChange(url);
    } catch (err) {
      onError?.(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Paste a URL or upload from your device (max {MAX_IMAGE_UPLOAD_MB} MB, JPG/PNG/WEBP/GIF). Served via CloudFront.
      </p>
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
          placeholder={placeholder}
          required={required}
        />
        <label className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap flex items-center shrink-0">
          {uploading ? 'Uploading...' : 'Upload'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleFileSelect(file);
              e.target.value = '';
            }}
          />
        </label>
      </div>
      {showPreview && isImageUrl(value) && (
        <div className="mt-3 flex items-start gap-3">
          <div className={`rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0 ${previewWrapperClassName}`}>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/200x120?text=Invalid+Image';
              }}
            />
          </div>
          <p className="text-xs text-gray-500 break-all pt-1">{value}</p>
        </div>
      )}
    </div>
  );
};

export default AdminImageUrlField;
