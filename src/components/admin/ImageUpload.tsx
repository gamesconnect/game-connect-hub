import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>;
  isUploading: boolean;
  preview: string | null;
  clearPreview: () => void;
}

export function ImageUpload({
  label,
  value,
  onChange,
  onFileSelect,
  isUploading,
  preview,
  clearPreview,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = await onFileSelect(e);
    if (url) {
      onChange(url);
    }
  };

  const displayImage = preview || value;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {displayImage ? (
        <div className="relative">
          <img
            src={displayImage}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={() => {
              onChange('');
              clearPreview();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload image</span>
              <span className="text-xs text-muted-foreground">Max 5MB</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">or</span>
        <Input
          type="url"
          placeholder="Paste image URL..."
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            clearPreview();
          }}
          className="text-sm"
        />
      </div>
    </div>
  );
}
