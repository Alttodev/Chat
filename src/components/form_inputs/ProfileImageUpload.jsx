import { useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { Input } from "../ui/input";

export function ProfileImageUpload({ name, control, rules, disabled = false }) {
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (file, onChange) => {
    if (!file) return;
    onChange(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result);
    reader.readAsDataURL(file);
  };

  const handleImageRemove = (onChange) => {
    onChange(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e, onChange) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleImageSelect(files[0], onChange);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value, onChange } }) => (
        <div className="flex flex-col items-center gap-4">
          {/* Round Avatar Upload Box */}
          <div
            className="relative w-32 h-32 rounded-full border-4  border-gray-300 flex items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition overflow-hidden"
            onDrop={(e) => handleDrop(e, onChange)}
            onDragOver={handleDragOver}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e.target.files?.[0], onChange)}
              className="hidden"
              disabled={disabled}
            />

            {imagePreview ? (
              <div className="relative w-full h-full">
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-1">
                <Upload className="w-6 h-6 text-gray-400" />
                <p className="text-xs text-gray-500 font-medium">
                  Upload Photo
                </p>
              </div>
            )}
          </div>

          {/* Remove Button */}
          {value && imagePreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleImageRemove(onChange)}
              disabled={disabled}
              className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 cursor-pointer"
            >
              <X className="w-4 h-4 mr-1" /> Remove Photo
            </Button>
          )}
        </div>
      )}
    />
  );
}

export default ProfileImageUpload;
