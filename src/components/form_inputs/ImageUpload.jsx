import { useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

export function ImageUpload({ name, control, rules }) {
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
        <div className="flex gap-3">
          {/* Upload Box */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg w-32 h-32 flex flex-col items-center justify-center text-center p-2",
              "hover:border-primary/50 hover:bg-muted/50",
              "focus-within:border-primary focus-within:bg-muted/50"
            )}
            onDrop={(e) => handleDrop(e, onChange)}
            onDragOver={handleDragOver}
          >
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e.target.files?.[0], onChange)}
              className="hidden"
            />

            {!value ? (
              <div className="space-y-1">
                <Upload className="w-5 h-5 mx-auto text-muted-foreground" />
                <p className="text-xs">Upload</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-xs">
                <ImageIcon className="w-4 h-4 text-green-600 mb-1" />
                <span className="truncate max-w-[90px]">{value.name}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleImageRemove(onChange)}
                  className="mt-1 h-6 text-xs px-2 text-destructive"
                >
                  <X className="w-3 h-3 mr-1" /> Remove
                </Button>
              </div>
            )}
          </div>

          {/* Preview Box */}
          <div className="w-32 h-32 border rounded-lg flex items-center justify-center relative overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground text-xs">
                <ImageIcon className="w-5 h-5 mb-1" />
                <p>No Preview</p>
              </div>
            )}

            {imagePreview && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleImageRemove(onChange)}
                className="absolute top-1 right-1 h-5 w-5 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    />
  );
}
