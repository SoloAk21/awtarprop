import React, { useState } from 'react';
import { apiClient } from '../api/client.js';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

export interface ImageUploaderProps {
  propertyId: string;
  onUploadSuccess: (images: any[]) => void;
}

export function ImageUploader({
  propertyId,
  onUploadSuccess,
}: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files).slice(0, 5);
      setSelectedFiles(filesArr);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });

      const response = await apiClient.post(
        `/properties/${propertyId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onUploadSuccess(response.data.data.images);
      setSelectedFiles([]);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Image upload failed'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-2xl text-center space-y-3">
      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <ImageIcon className="w-5 h-5" />
      </div>

      <div>
        <p className="text-xs font-bold text-slate-800">
          Upload Property Photos
        </p>
        <p className="text-[11px] text-slate-400">
          Upload up to 5 photos (JPEG, PNG, WebP up to 5MB)
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-600 font-semibold">
          {error}
        </div>
      )}

      <input
        type="file"
        id="property-photos"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex justify-center gap-2">
        <label
          htmlFor="property-photos"
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-100"
        >
          Select Files ({selectedFiles.length})
        </label>

        {selectedFiles.length > 0 && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-emerald-700 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload ({selectedFiles.length})</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
